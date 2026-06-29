import type { EvidenceStore } from './evidence-store.js';
import type { SessionEvent } from '../config/schema.js';

export function recordCommand(
  evidenceStore: EvidenceStore,
  sessionId: string,
  command: string,
  exitCode: number | null,
  output?: string
): void {
  const isValidation =
    command.includes('test') ||
    command.includes('lint') ||
    command.includes('build') ||
    command.includes('check') ||
    command.includes('typecheck') ||
    command.includes('format');

  const event: SessionEvent = {
    type: isValidation ? 'validation.completed' : 'command.executed',
    sessionId,
    timestamp: new Date().toISOString(),
    command,
    result: exitCode === 0 ? 'passed' : exitCode !== null ? 'failed' : 'unknown',
    exitCode,
  };

  if (output !== undefined) {
    event.details = { ...event.details, outputLength: output.length };
  }

  evidenceStore.add(event);
}

export function recordValidation(
  evidenceStore: EvidenceStore,
  sessionId: string,
  command: string,
  status: 'passed' | 'failed' | 'skipped',
  exitCode: number | null
): void {
  const event: SessionEvent = {
    type: 'validation.completed',
    sessionId,
    timestamp: new Date().toISOString(),
    command,
    result: status,
    exitCode,
  };

  evidenceStore.add(event);
}
