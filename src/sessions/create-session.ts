import type { SessionRecord } from '../config/schema.js';

let counter = 0;

export function generateSessionId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  counter = (counter % 999) + 1;
  const seq = String(counter).padStart(3, '0');
  return `ses_${y}_${m}_${d}_${seq}`;
}

export function createSessionRecord(params: {
  sessionId: string;
  projectId: string;
  objectiveId?: string;
  parentSessionId?: string;
  workerId?: string;
  agentRole?: 'supervisor' | 'worker';
  repository: string;
  branch: string;
}): SessionRecord {
  return {
    sessionId: params.sessionId,
    projectId: params.projectId,
    objectiveId: params.objectiveId,
    parentSessionId: params.parentSessionId,
    workerId: params.workerId,
    agentRole: params.agentRole,
    repository: params.repository,
    branch: params.branch,
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'active',
    eventCount: 0,
  };
}
