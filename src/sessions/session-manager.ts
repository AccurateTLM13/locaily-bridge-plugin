import type { ResolvedProject, ProjectContext, SessionRecord, DelegationRecord } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';
import { createBrainClient } from '../brain/client-factory.js';
import { generateSessionId, createSessionRecord } from './create-session.js';
import { createEvent } from './record-event.js';
import { closeSession as closeAndWrite } from './close-session.js';
import { SessionObserver } from '../observer/index.js';
import { GuardrailEngine } from '../guardrails/index.js';
import { SessionHierarchy } from './session-hierarchy.js';
import { DelegationTracker } from './delegation-tracker.js';
import { ConflictDetector } from './conflict-detector.js';

interface ActiveSession {
  sessionId: string;
  objectiveId?: string;
  project: ResolvedProject;
  client: LocalBrainClient;
  observer: SessionObserver;
  guardrails: GuardrailEngine;
  hierarchy: SessionHierarchy;
  delegationTracker: DelegationTracker;
  conflictDetector: ConflictDetector;
  eventCount: number;
}

let current: ActiveSession | null = null;

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

export function initSession(project: ResolvedProject, objectiveId?: string): string {
  if (current) return current.sessionId;

  const sessionId = generateSessionId();
  const client = createBrainClient(project);
  const record = createSessionRecord({
    sessionId,
    projectId: project.projectId,
    objectiveId,
    repository: project.repository,
    branch: project.currentBranch,
  });

  client.createSession(record);

  const loadEvent = createEvent({
    type: 'context.loaded',
    sessionId,
    details: { projectId: project.projectId, objectiveId, commit: project.currentCommit },
  });
  client.appendSessionEvent(sessionId, loadEvent);

  const observer = new SessionObserver();
  observer.start(project.gitRoot, sessionId);

  observer.evidence.add(loadEvent);

  const hierarchy = new SessionHierarchy(client, project.projectId);
  const delegationTracker = new DelegationTracker(client, project.projectId);
  const conflictDetector = new ConflictDetector(client, project.projectId);

  current = { sessionId, objectiveId, project, client, observer, guardrails: new GuardrailEngine(), hierarchy, delegationTracker, conflictDetector, eventCount: 1 };
  return sessionId;
}

export function initChildSession(params: {
  parentSessionId: string;
  workerId?: string;
  task: string;
  contextSnapshot: string;
}): string {
  if (!current) throw new SessionError('No active parent session. Call initSession first.');

  const sessionId = generateSessionId();
  const record = createSessionRecord({
    sessionId,
    projectId: current.project.projectId,
    objectiveId: current.objectiveId,
    parentSessionId: params.parentSessionId,
    workerId: params.workerId,
    agentRole: 'worker',
    repository: current.project.repository,
    branch: current.project.currentBranch,
  });

  current.client.createSession(record);

  if (params.workerId) {
    current.delegationTracker.createDelegation({
      parentSessionId: params.parentSessionId,
      childSessionId: sessionId,
      delegatedBy: current.project.projectId,
      assignedTo: params.workerId,
      task: params.task,
      contextSnapshot: params.contextSnapshot,
    });
  }

  const loadEvent = createEvent({
    type: 'context.loaded',
    sessionId,
    details: { parentSessionId: params.parentSessionId, workerId: params.workerId, task: params.task },
  });
  current.client.appendSessionEvent(sessionId, loadEvent);

  return sessionId;
}

export function getSession(): {
  sessionId: string;
  client: LocalBrainClient;
  project: ResolvedProject;
  observer: SessionObserver;
  guardrails: GuardrailEngine;
  hierarchy: SessionHierarchy;
  delegationTracker: DelegationTracker;
  conflictDetector: ConflictDetector;
} | null {
  if (!current) return null;
  return {
    sessionId: current.sessionId,
    client: current.client,
    project: current.project,
    observer: current.observer,
    guardrails: current.guardrails,
    hierarchy: current.hierarchy,
    delegationTracker: current.delegationTracker,
    conflictDetector: current.conflictDetector,
  };
}

export function requireSession(): {
  sessionId: string;
  client: LocalBrainClient;
  project: ResolvedProject;
  observer: SessionObserver;
  guardrails: GuardrailEngine;
  hierarchy: SessionHierarchy;
  delegationTracker: DelegationTracker;
  conflictDetector: ConflictDetector;
} {
  const session = getSession();
  if (!session) {
    throw new SessionError(
      'No active session. Call locaily_project_context first to initialize the plugin.'
    );
  }
  return session;
}

export function setContextForGuardrails(context: ProjectContext): void {
  if (!current) return;
  current.guardrails.setContext(context);
}

export function checkScopeViolation(
  action: string,
  context: ProjectContext
): string | null {
  if (!current) return null;
  const result = current.guardrails.checkScopeViolation(action, context);
  if (result) {
    current.guardrails.recordScopeViolation(result.message);
    return result.message;
  }
  return null;
}

export function recordProgressEvent(summary: string, files?: string[]): string {
  const { sessionId, client, observer } = requireSession();
  const event = createEvent({
    type: 'progress.reported',
    sessionId,
    details: { summary, files: files ?? [] },
  });
  client.appendSessionEvent(sessionId, event);
  observer.evidence.add(event);
  if (current) current.eventCount++;
  return event.eventId;
}

export function recordDecisionEvent(decision: string, reason: string): string {
  const { sessionId, client, observer } = requireSession();
  const event = createEvent({
    type: 'decision.made',
    sessionId,
    decision,
    reason,
  });
  client.appendSessionEvent(sessionId, event);
  observer.evidence.add(event);
  if (current) current.eventCount++;
  return event.eventId;
}

export function recordBlockerEvent(blocker: string, impact?: string): string {
  const { sessionId, client, observer } = requireSession();
  const event = createEvent({
    type: 'blocker.encountered',
    sessionId,
    reason: blocker,
    impact,
  });
  client.appendSessionEvent(sessionId, event);
  observer.evidence.add(event);
  if (current) current.eventCount++;
  return event.eventId;
}

export function recordValidationEvent(
  command: string,
  status: string,
  exitCode: number | null
): string {
  const { sessionId, client, observer } = requireSession();
  const event = createEvent({
    type: 'validation.completed',
    sessionId,
    command,
    result: status,
    exitCode,
  });
  client.appendSessionEvent(sessionId, event);
  observer.evidence.add(event);
  if (current) current.eventCount++;
  return event.eventId;
}

export function recordCommandEvent(
  command: string,
  exitCode: number | null,
  output?: string
): string {
  const { sessionId, client, observer } = requireSession();

  const isValidation =
    command.includes('test') ||
    command.includes('lint') ||
    command.includes('build') ||
    command.includes('check') ||
    command.includes('typecheck');

  const event = createEvent({
    type: isValidation ? 'validation.completed' : 'command.executed',
    sessionId,
    command,
    result: exitCode === 0 ? 'passed' : exitCode !== null ? 'failed' : 'unknown',
    exitCode,
    details: output !== undefined ? { outputLength: output.length } : undefined,
  });

  client.appendSessionEvent(sessionId, event);
  observer.evidence.add(event);
  if (current) current.eventCount++;
  return event.eventId;
}

export function getObserver(): SessionObserver | null {
  if (!current) return null;
  return current.observer;
}

export async function closeSession(status: SessionRecord['status']): Promise<void> {
  if (!current) throw new SessionError('No active session to close.');

  current.observer.stop();

  const completeEvent = createEvent({
    type: 'session.completed',
    sessionId: current.sessionId,
    details: { status },
  });
  current.client.appendSessionEvent(current.sessionId, completeEvent);

  await closeAndWrite(current.client, current.sessionId, status);
  current = null;
}
