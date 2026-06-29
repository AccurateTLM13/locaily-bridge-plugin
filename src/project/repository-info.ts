import { execSync } from 'child_process';

export interface RepositoryInfo {
  gitRoot: string;
  currentBranch: string;
  currentCommit: string;
}

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export function getRepositoryInfo(workingDir: string): RepositoryInfo {
  let gitRoot: string;
  try {
    gitRoot = execSync('git rev-parse --show-toplevel', {
      cwd: workingDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    throw new GitError(
      `Not a Git repository (or Git is not installed): "${workingDir}"`
    );
  }

  let currentBranch: string;
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: gitRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    currentBranch = 'unknown';
  }

  let currentCommit: string;
  try {
    currentCommit = execSync('git rev-parse HEAD', {
      cwd: gitRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    currentCommit = 'unknown';
  }

  return { gitRoot, currentBranch, currentCommit };
}
