import type { SessionEvent } from '../config/schema.js';

let eventCounter = 0;

export function generateEventId(): string {
  eventCounter++;
  return `evt_${Date.now()}_${String(eventCounter).padStart(4, '0')}`;
}

export function createEvent(params: {
  type: string;
  sessionId: string;
  command?: string;
  result?: string;
  exitCode?: number | null;
  filePath?: string;
  decision?: string;
  reason?: string;
  impact?: string;
  branch?: string;
  details?: Record<string, unknown>;
}): SessionEvent & { eventId: string } {
  const eventId = generateEventId();
  const event: SessionEvent & { eventId: string } = {
    eventId,
    type: params.type,
    sessionId: params.sessionId,
    timestamp: new Date().toISOString(),
  };
  if (params.command !== undefined) event.command = params.command;
  if (params.result !== undefined) event.result = params.result;
  if (params.exitCode !== undefined) event.exitCode = params.exitCode;
  if (params.filePath !== undefined) event.filePath = params.filePath;
  if (params.decision !== undefined) event.decision = params.decision;
  if (params.reason !== undefined) event.reason = params.reason;
  if (params.impact !== undefined) event.impact = params.impact;
  if (params.branch !== undefined) event.branch = params.branch;
  if (params.details !== undefined) event.details = params.details;
  return event;
}
