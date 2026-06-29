import { EvidenceStore } from './evidence-store.js';
import { startFileWatcher } from './file-watcher.js';
import { recordCommand, recordValidation } from './command-tracker.js';

export class SessionObserver {
  readonly evidence: EvidenceStore;
  private stopWatcher: (() => void) | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.evidence = new EvidenceStore();
  }

  start(rootDir: string, sessionId: string): void {
    this.sessionId = sessionId;
    this.evidence.clear();

    this.stopWatcher = startFileWatcher({
      rootDir,
      evidenceStore: this.evidence,
      sessionId,
    });
  }

  stop(): void {
    if (this.stopWatcher) {
      this.stopWatcher();
      this.stopWatcher = null;
    }
  }

  recordCommand(command: string, exitCode: number | null, output?: string): void {
    if (!this.sessionId) return;
    recordCommand(this.evidence, this.sessionId, command, exitCode, output);
  }

  recordValidation(
    command: string,
    status: 'passed' | 'failed' | 'skipped',
    exitCode: number | null
  ): void {
    if (!this.sessionId) return;
    recordValidation(this.evidence, this.sessionId, command, status, exitCode);
  }

  get isActive(): boolean {
    return this.sessionId !== null;
  }
}

export { EvidenceStore } from './evidence-store.js';
export { startFileWatcher } from './file-watcher.js';
export { recordCommand, recordValidation } from './command-tracker.js';
