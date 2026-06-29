import type { DelegationRecord } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';

let delegationCounter = 0;

export function generateDelegationId(): string {
  delegationCounter++;
  return `del_${Date.now()}_${String(delegationCounter).padStart(4, '0')}`;
}

export class DelegationTracker {
  private client: LocalBrainClient;
  private projectId: string;

  constructor(client: LocalBrainClient, projectId: string) {
    this.client = client;
    this.projectId = projectId;
  }

  async createDelegation(params: {
    parentSessionId: string;
    childSessionId: string;
    delegatedBy: string;
    assignedTo: string;
    task: string;
    contextSnapshot: string;
  }): Promise<DelegationRecord> {
    const delegation: DelegationRecord = {
      delegationId: generateDelegationId(),
      parentSessionId: params.parentSessionId,
      childSessionId: params.childSessionId,
      delegatedBy: params.delegatedBy,
      assignedTo: params.assignedTo,
      task: params.task,
      contextSnapshot: params.contextSnapshot,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await this.client.recordDelegation(this.projectId, delegation);
    return delegation;
  }

  async completeDelegation(delegationId: string): Promise<void> {
    await this.client.updateDelegationStatus(delegationId, 'completed');
  }

  async failDelegation(delegationId: string): Promise<void> {
    await this.client.updateDelegationStatus(delegationId, 'failed');
  }

  async cancelDelegation(delegationId: string): Promise<void> {
    await this.client.updateDelegationStatus(delegationId, 'cancelled');
  }

  async getActiveDelegations(parentSessionId?: string): Promise<DelegationRecord[]> {
    const all = await this.client.listDelegations(this.projectId);
    return all.filter((d) => {
      if (d.status !== 'active') return false;
      if (parentSessionId && d.parentSessionId !== parentSessionId) return false;
      return true;
    });
  }

  async getDelegationsForSession(sessionId: string): Promise<DelegationRecord[]> {
    const all = await this.client.listDelegations(this.projectId);
    return all.filter(
      (d) => d.parentSessionId === sessionId || d.childSessionId === sessionId
    );
  }
}
