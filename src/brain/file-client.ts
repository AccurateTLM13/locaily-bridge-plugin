import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, appendFileSync } from 'fs';
import { join } from 'path';
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
import type { LocalBrainClient } from './client.js';

export class FileBrainClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileBrainClientError';
  }
}

function readJson<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function ensureDir(filePath: string): void {
  const sep = filePath.includes('\\') ? '\\' : '/';
  const idx = filePath.lastIndexOf(sep);
  if (idx === -1) return;
  const dir = filePath.substring(0, idx);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(filePath);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class FileBrainClient implements LocalBrainClient {
  private project: ResolvedProject;

  constructor(project: ResolvedProject) {
    this.project = project;
  }

  async resolveProject(): Promise<ResolvedProject> {
    return this.project;
  }

  async getProjectContext(): Promise<ProjectContext> {
    const projectJsonPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'project.json'
    );

    const objectivePath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'objectives',
      'active.json'
    );

    if (!existsSync(projectJsonPath)) {
      throw new FileBrainClientError(
        `Project record not found at "${projectJsonPath}".`
      );
    }

    const projectRecord = readJson<{
      projectId: string;
      name: string;
      activeObjectiveId?: string;
    }>(projectJsonPath);

    let objective: Objective | null = null;
    if (existsSync(objectivePath)) {
      objective = readJson<Objective>(objectivePath);
    } else if (projectRecord.activeObjectiveId) {
      const objPath = join(
        this.project.localBrainPath,
        'projects',
        this.project.projectId,
        'objectives',
        `${projectRecord.activeObjectiveId}.json`
      );
      if (existsSync(objPath)) {
        objective = readJson<Objective>(objPath);
      }
    }

    const defaultObjective: Objective = {
      objectiveId: 'unknown',
      projectId: this.project.projectId,
      title: 'No active objective',
      scope: '',
      outOfScope: [],
      validation: [],
      stopConditions: [],
      activeSlice: '',
      status: 'unknown',
      priority: 'low',
    };

    const obj = objective ?? defaultObjective;

    const priorHandoff = await this.readLatestHandoff();

    return {
      projectId: this.project.projectId,
      name: projectRecord.name ?? this.project.projectId,
      objectiveTitle: obj.title,
      scope: obj.scope,
      outOfScope: obj.outOfScope,
      architecture: [],
      recentDecisions: [],
      priorHandoff,
      validation: obj.validation,
      stopConditions: obj.stopConditions,
      activeSlice: obj.activeSlice,
    };
  }

  async getActiveObjective(): Promise<Objective> {
    const objectivePath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'objectives',
      'active.json'
    );

    if (!existsSync(objectivePath)) {
      throw new FileBrainClientError(
        `No active objective found at "${objectivePath}".`
      );
    }

    return readJson<Objective>(objectivePath);
  }

  async createSession(session: SessionRecord): Promise<string> {
    const sessionPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'sessions',
      `${session.sessionId}.json`
    );
    writeJson(sessionPath, session);

    return session.sessionId;
  }

  async appendSessionEvent(sessionId: string, event: SessionEvent): Promise<void> {
    const eventsDir = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'sessions',
      sessionId
    );

    if (!existsSync(eventsDir)) {
      mkdirSync(eventsDir, { recursive: true });
    }

    const eventsPath = join(eventsDir, 'events.jsonl');
    writeFileSync(eventsPath, JSON.stringify(event) + '\n', { flag: 'a', encoding: 'utf-8' });
  }

  async getHandoff(sessionId: string): Promise<HandoffRecord> {
    const handoffPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'handoffs',
      `${sessionId}.json`
    );

    if (!existsSync(handoffPath)) {
      throw new FileBrainClientError(`Handoff not found for session: "${sessionId}"`);
    }

    return readJson<HandoffRecord>(handoffPath);
  }

  async submitHandoff(handoff: HandoffRecord): Promise<void> {
    const handoffDir = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'handoffs'
    );

    if (!existsSync(handoffDir)) {
      mkdirSync(handoffDir, { recursive: true });
    }

    const handoffPath = join(handoffDir, `${handoff.sessionId}.json`);
    writeJson(handoffPath, handoff);
  }

  async reportBlocker(sessionId: string, blocker: Blocker): Promise<void> {
    const blockerDir = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'blockers'
    );

    if (!existsSync(blockerDir)) {
      mkdirSync(blockerDir, { recursive: true });
    }

    const blockerPath = join(blockerDir, `${sessionId}_${Date.now()}.json`);
    writeJson(blockerPath, blocker);
  }

  async getSession(sessionId: string): Promise<SessionRecord> {
    const sessionPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'sessions',
      `${sessionId}.json`
    );

    if (!existsSync(sessionPath)) {
      throw new FileBrainClientError(`Session not found: "${sessionId}"`);
    }

    return readJson<SessionRecord>(sessionPath);
  }

  async listSessions(projectId: string): Promise<SessionRecord[]> {
    const sessionsDir = join(
      this.project.localBrainPath,
      'projects',
      projectId,
      'sessions'
    );

    if (!existsSync(sessionsDir)) return [];

    const files = readdirSync(sessionsDir).filter((f) => f.endsWith('.json') && !f.endsWith('.jsonl'));
    const sessions: SessionRecord[] = [];

    for (const file of files) {
      try {
        sessions.push(readJson<SessionRecord>(join(sessionsDir, file)));
      } catch {
        // skip malformed session files
      }
    }

    return sessions;
  }

  async getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
    const eventsPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'sessions',
      sessionId,
      'events.jsonl'
    );

    if (!existsSync(eventsPath)) return [];

    const raw = readFileSync(eventsPath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    return lines.map((line) => JSON.parse(line) as SessionEvent);
  }

  async recordDelegation(projectId: string, delegation: DelegationRecord): Promise<void> {
    const delDir = join(
      this.project.localBrainPath,
      'projects',
      projectId,
      'delegations'
    );

    const delPath = join(delDir, `${delegation.delegationId}.json`);
    writeJson(delPath, delegation);
  }

  async updateDelegationStatus(delegationId: string, status: DelegationRecord['status']): Promise<void> {
    const delDir = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'delegations'
    );

    const delPath = join(delDir, `${delegationId}.json`);

    if (!existsSync(delPath)) {
      throw new FileBrainClientError(`Delegation not found: "${delegationId}"`);
    }

    const delegation = readJson<DelegationRecord>(delPath);
    delegation.status = status;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      delegation.completedAt = new Date().toISOString();
    }
    writeJson(delPath, delegation);
  }

  async listDelegations(projectId: string): Promise<DelegationRecord[]> {
    const delDir = join(
      this.project.localBrainPath,
      'projects',
      projectId,
      'delegations'
    );

    if (!existsSync(delDir)) return [];

    const files = readdirSync(delDir).filter((f) => f.endsWith('.json'));
    return files.map((f) => readJson<DelegationRecord>(join(delDir, f)));
  }

  async updateConflictStatus(projectId: string, filePath: string, status: string): Promise<void> {
    const conflictsDir = join(
      this.project.localBrainPath,
      'projects',
      projectId,
      'conflicts'
    );

    if (!existsSync(conflictsDir)) return;

    const files = readdirSync(conflictsDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const conflictPath = join(conflictsDir, file);
      const conflict = readJson<{ filePath: string; status: string }>(conflictPath);
      if (conflict.filePath === filePath) {
        conflict.status = status;
        writeJson(conflictPath, conflict);
        return;
      }
    }
  }

  async closeSession(sessionId: string, status: SessionRecord['status'] = 'completed'): Promise<void> {
    const sessionPath = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'sessions',
      `${sessionId}.json`
    );

    if (!existsSync(sessionPath)) {
      throw new FileBrainClientError(
        `Cannot close session: no record found at "${sessionPath}".`
      );
    }

    const session = readJson<SessionRecord>(sessionPath);
    session.status = status;
    session.endedAt = new Date().toISOString();
    writeJson(sessionPath, session);
  }

  private async readLatestHandoff(): Promise<string> {
    const handoffDir = join(
      this.project.localBrainPath,
      'projects',
      this.project.projectId,
      'handoffs'
    );

    if (!existsSync(handoffDir)) {
      return '';
    }

    const files = readdirSync(handoffDir).filter((f) => f.endsWith('.json'));

    if (files.length === 0) {
      return '';
    }

    files.sort().reverse();
    const latest = readJson<HandoffRecord>(join(handoffDir, files[0]));
    return latest.summary
      ? `${latest.summary}${latest.nextRecommendedAction ? ` Next: ${latest.nextRecommendedAction}` : ''}`
      : '';
  }
}
