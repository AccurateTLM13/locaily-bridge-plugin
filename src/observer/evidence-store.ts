import type { SessionEvent } from '../config/schema.js';

export interface ValidationResult {
  command: string;
  status: string;
  exitCode: number | null;
}

export class EvidenceStore {
  private events: SessionEvent[] = [];

  add(event: SessionEvent): void {
    this.events.push(event);
  }

  getAll(): SessionEvent[] {
    return [...this.events];
  }

  getByType(type: string): SessionEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  getFileChanges(): string[] {
    const changed = this.getByType('file.changed');
    const files = changed.map((e) => e.filePath).filter(Boolean) as string[];
    return [...new Set(files)];
  }

  getValidationResults(): ValidationResult[] {
    return this.getByType('validation.completed').map((e) => ({
      command: e.command || '',
      status: e.result || 'unknown',
      exitCode: e.exitCode ?? null,
    }));
  }

  getCommandExecutions(): SessionEvent[] {
    return this.getByType('command.executed');
  }

  hasValidationPassed(command: string): boolean {
    return this.getValidationResults().some(
      (v) => v.command === command && v.exitCode === 0
    );
  }

  hasFileChange(filePath: string): boolean {
    return this.getFileChanges().some((f) =>
      f.replace(/\\/g, '/').endsWith(filePath.replace(/\\/g, '/'))
    );
  }

  getBlockerCount(): number {
    return this.getByType('blocker.encountered').length;
  }

  clear(): void {
    this.events = [];
  }

  get count(): number {
    return this.events.length;
  }
}
