import type {
  ResolvedProject,
  ProjectContext,
  Objective,
  SessionRecord,
  SessionEvent,
  HandoffRecord,
  Blocker,
  DelegationRecord,
} from '../config/schema.js';

export interface LocalBrainClient {
  resolveProject(): Promise<ResolvedProject>;
  getProjectContext(): Promise<ProjectContext>;
  getActiveObjective(): Promise<Objective>;
  createSession(session: SessionRecord): Promise<string>;
  getSession(sessionId: string): Promise<SessionRecord>;
  listSessions(projectId: string): Promise<SessionRecord[]>;
  getSessionEvents(sessionId: string): Promise<SessionEvent[]>;
  appendSessionEvent(sessionId: string, event: SessionEvent): Promise<void>;
  getHandoff(sessionId: string): Promise<HandoffRecord>;
  submitHandoff(handoff: HandoffRecord): Promise<void>;
  reportBlocker(sessionId: string, blocker: Blocker): Promise<void>;
  closeSession(sessionId: string, status?: SessionRecord['status']): Promise<void>;
  recordDelegation(projectId: string, delegation: DelegationRecord): Promise<void>;
  updateDelegationStatus(delegationId: string, status: DelegationRecord['status']): Promise<void>;
  listDelegations(projectId: string): Promise<DelegationRecord[]>;
  updateConflictStatus(projectId: string, filePath: string, status: string): Promise<void>;
}
