import type { SessionRecord, SessionTreeNode } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';

export class SessionHierarchyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionHierarchyError';
  }
}

export class SessionHierarchy {
  private client: LocalBrainClient;
  private projectId: string;

  constructor(client: LocalBrainClient, projectId: string) {
    this.client = client;
    this.projectId = projectId;
  }

  async getAncestors(sessionId: string): Promise<SessionRecord[]> {
    const ancestors: SessionRecord[] = [];
    let current = await this.client.getSession(sessionId);

    while (current.parentSessionId) {
      const parent = await this.client.getSession(current.parentSessionId);
      ancestors.unshift(parent);
      current = parent;
    }

    return ancestors;
  }

  async getDescendants(sessionId: string): Promise<SessionRecord[]> {
    const allSessions = await this.client.listSessions(this.projectId);
    const descendants: SessionRecord[] = [];

    function collect(parentId: string): void {
      const children = allSessions.filter((s) => s.parentSessionId === parentId);
      for (const child of children) {
        descendants.push(child);
        collect(child.sessionId);
      }
    }

    collect(sessionId);
    return descendants;
  }

  async buildTree(sessionId?: string): Promise<SessionTreeNode[]> {
    const allSessions = await this.client.listSessions(this.projectId);

    if (sessionId) {
      const target = allSessions.find((s) => s.sessionId === sessionId);
      if (!target) {
        throw new SessionHierarchyError(`Session not found: ${sessionId}`);
      }
      return [this.toTreeNode(target, allSessions)];
    }

    const roots = allSessions.filter((s) => !s.parentSessionId);
    return roots.map((r) => this.toTreeNode(r, allSessions));
  }

  async isWorkerOf(sessionId: string, parentSessionId: string): Promise<boolean> {
    const session = await this.client.getSession(sessionId);
    let current = session;
    while (current.parentSessionId) {
      if (current.parentSessionId === parentSessionId) return true;
      current = await this.client.getSession(current.parentSessionId);
    }
    return false;
  }

  private toTreeNode(record: SessionRecord, allSessions: SessionRecord[]): SessionTreeNode {
    const children = allSessions
      .filter((s) => s.parentSessionId === record.sessionId)
      .map((s) => this.toTreeNode(s, allSessions));

    return {
      sessionId: record.sessionId,
      workerId: record.workerId,
      agentRole: record.agentRole,
      status: record.status,
      children,
    };
  }
}
