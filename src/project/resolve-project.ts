import { existsSync } from 'fs';
import { loadConfig } from '../config/load-config.js';
import { getRepositoryInfo } from './repository-info.js';
import type { BrainMode, ResolvedProject } from '../config/schema.js';

export class ResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResolutionError';
  }
}

function detectBrainMode(localBrain: string, explicit?: BrainMode): BrainMode {
  if (explicit) return explicit;
  if (localBrain.startsWith('http://') || localBrain.startsWith('https://')) {
    return 'http';
  }
  return 'file';
}

export function resolveProject(workingDir: string): ResolvedProject {
  const config = loadConfig(workingDir);

  const repoInfo = getRepositoryInfo(workingDir);

  const brainMode = detectBrainMode(config.localBrain, config.brainMode);

  if (brainMode === 'file' && !existsSync(config.localBrain)) {
    console.warn(
      `[locaily] Warning: Local Brain path does not exist: "${config.localBrain}"`
    );
  }

  const apiBaseUrl = brainMode === 'http'
    ? config.localBrain
    : undefined;

  return {
    projectId: config.projectId,
    localBrainPath: config.localBrain,
    repository: config.repository,
    gitRoot: repoInfo.gitRoot,
    currentBranch: repoInfo.currentBranch,
    currentCommit: repoInfo.currentCommit,
    brainMode,
    apiBaseUrl,
    apiKey: config.apiKey,
  };
}
