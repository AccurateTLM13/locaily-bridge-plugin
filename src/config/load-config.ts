import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { ProjectLinkConfig } from './schema.js';

const REGISTRY_FILE = '.opencode/locaily.json';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function findRegistryPath(searchRoot: string): string | null {
  let current = resolve(searchRoot);

  while (true) {
    const candidate = join(current, REGISTRY_FILE);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }

  return null;
}

export function loadConfig(searchRoot: string): ProjectLinkConfig {
  const registryPath = findRegistryPath(searchRoot);

  if (!registryPath) {
    throw new ConfigError(
      `No .opencode/locaily.json found. Searched from "${searchRoot}" up to the filesystem root.`
    );
  }

  let raw: string;
  try {
    raw = readFileSync(registryPath, 'utf-8');
  } catch (err) {
    throw new ConfigError(
      `Failed to read registry file at "${registryPath}": ${err}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError(
      `Invalid JSON in registry file at "${registryPath}".`
    );
  }

  const config = parsed as Record<string, unknown>;

  if (!config.schemaVersion || config.schemaVersion !== 'locaily.project-link.v1') {
    throw new ConfigError(
      `Missing or invalid schemaVersion in "${registryPath}". Expected "locaily.project-link.v1".`
    );
  }

  if (!config.projectId || typeof config.projectId !== 'string') {
    throw new ConfigError(
      `Missing or invalid "projectId" in "${registryPath}".`
    );
  }

  if (!config.localBrain || typeof config.localBrain !== 'string') {
    throw new ConfigError(
      `Missing or invalid "localBrain" path in "${registryPath}".`
    );
  }

  if (!config.repository || typeof config.repository !== 'string') {
    throw new ConfigError(
      `Missing or invalid "repository" in "${registryPath}".`
    );
  }

  const mode = config.mode as string | undefined;
  if (mode && !['manual', 'assisted', 'enforced'].includes(mode)) {
    throw new ConfigError(
      `Invalid mode "${mode}" in "${registryPath}". Must be "manual", "assisted", or "enforced".`
    );
  }

  const brainMode = config.brainMode as string | undefined;
  if (brainMode && !['file', 'http'].includes(brainMode)) {
    throw new ConfigError(
      `Invalid brainMode "${brainMode}" in "${registryPath}". Must be "file" or "http".`
    );
  }

  if (config.apiKey !== undefined && typeof config.apiKey !== 'string') {
    throw new ConfigError(
      `Invalid "apiKey" in "${registryPath}". Must be a string.`
    );
  }

  return {
    schemaVersion: config.schemaVersion as string,
    projectId: config.projectId as string,
    localBrain: config.localBrain as string,
    repository: config.repository as string,
    mode: (mode as 'manual' | 'assisted' | 'enforced') ?? 'manual',
    brainMode: (brainMode as 'file' | 'http') ?? undefined,
    apiKey: config.apiKey as string | undefined,
  };
}
