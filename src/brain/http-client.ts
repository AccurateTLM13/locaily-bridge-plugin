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

export class HttpBrainClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HttpBrainClientError';
  }
}

export class HttpBrainClient implements LocalBrainClient {
  private project: ResolvedProject;
  private baseUrl: string;
  private projectId: string;
  private headers: Record<string, string>;

  constructor(project: ResolvedProject) {
    this.project = project;
    this.projectId = project.projectId;
    this.baseUrl = (project.apiBaseUrl || project.localBrainPath).replace(/\/+$/, '');
    this.headers = { 'Content-Type': 'application/json' };
    if (project.apiKey) {
      this.headers['Authorization'] = `Bearer ${project.apiKey}`;
    }
  }

  async resolveProject(): Promise<ResolvedProject> {
    return this.project;
  }

  async getProjectContext(): Promise<ProjectContext> {
    const res = await this.fetch(`/projects/${this.projectId}/context`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to get project context: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as ProjectContext;
  }

  async getActiveObjective(): Promise<Objective> {
    const res = await this.fetch(`/projects/${this.projectId}/objective`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to get active objective: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as Objective;
  }

  async createSession(session: SessionRecord): Promise<string> {
    const res = await this.fetch('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to create session: ${res.status} ${res.statusText}`
      );
    }
    const data = await res.json() as { sessionId?: string } | string;
    if (typeof data === 'string') return data;
    return data.sessionId ?? session.sessionId;
  }

  async appendSessionEvent(sessionId: string, event: SessionEvent): Promise<void> {
    const res = await this.fetch(`/sessions/${sessionId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to append event: ${res.status} ${res.statusText}`
      );
    }
  }

  async getHandoff(sessionId: string): Promise<HandoffRecord> {
    const res = await this.fetch(`/projects/${this.projectId}/handoffs/${sessionId}`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to get handoff: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as HandoffRecord;
  }

  async submitHandoff(handoff: HandoffRecord): Promise<void> {
    const res = await this.fetch(`/projects/${this.projectId}/handoffs`, {
      method: 'POST',
      body: JSON.stringify(handoff),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to submit handoff: ${res.status} ${res.statusText}`
      );
    }
  }

  async reportBlocker(sessionId: string, blocker: Blocker): Promise<void> {
    const event: SessionEvent = {
      type: 'blocker.encountered',
      sessionId,
      timestamp: new Date().toISOString(),
      reason: blocker.blocker,
      impact: blocker.impact,
    };
    const res = await this.fetch(`/sessions/${sessionId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to report blocker: ${res.status} ${res.statusText}`
      );
    }
  }

  async closeSession(sessionId: string, status: SessionRecord['status'] = 'completed'): Promise<void> {
    const res = await this.fetch(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, endedAt: new Date().toISOString() }),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to close session: ${res.status} ${res.statusText}`
      );
    }
  }

  async getSession(sessionId: string): Promise<SessionRecord> {
    const res = await this.fetch(`/sessions/${sessionId}`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to get session: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as SessionRecord;
  }

  async listSessions(projectId: string): Promise<SessionRecord[]> {
    const res = await this.fetch(`/projects/${projectId}/sessions`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to list sessions: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as SessionRecord[];
  }

  async getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
    const res = await this.fetch(`/sessions/${sessionId}/events`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to get session events: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as SessionEvent[];
  }

  async recordDelegation(projectId: string, delegation: DelegationRecord): Promise<void> {
    const res = await this.fetch(`/projects/${projectId}/delegations`, {
      method: 'POST',
      body: JSON.stringify(delegation),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to record delegation: ${res.status} ${res.statusText}`
      );
    }
  }

  async updateDelegationStatus(delegationId: string, status: DelegationRecord['status']): Promise<void> {
    const res = await this.fetch(`/delegations/${delegationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to update delegation: ${res.status} ${res.statusText}`
      );
    }
  }

  async listDelegations(projectId: string): Promise<DelegationRecord[]> {
    const res = await this.fetch(`/projects/${projectId}/delegations`);
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to list delegations: ${res.status} ${res.statusText}`
      );
    }
    return await res.json() as DelegationRecord[];
  }

  async updateConflictStatus(projectId: string, filePath: string, status: string): Promise<void> {
    const res = await this.fetch(`/projects/${projectId}/conflicts`, {
      method: 'PATCH',
      body: JSON.stringify({ filePath, status }),
    });
    if (!res.ok) {
      throw new HttpBrainClientError(
        `Failed to update conflict status: ${res.status} ${res.statusText}`
      );
    }
  }

  private async fetch(path: string, options?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    try {
      return await fetch(url, { ...options, headers: { ...this.headers, ...options?.headers } });
    } catch (err) {
      throw new HttpBrainClientError(
        `HTTP request failed for ${url}: ${err}`
      );
    }
  }
}
