export type OperatingMode = 'manual' | 'assisted' | 'enforced';
export type BrainMode = 'file' | 'http';

export interface ProjectLinkConfig {
  schemaVersion: string;
  projectId: string;
  localBrain: string;
  repository: string;
  mode?: OperatingMode;
  brainMode?: BrainMode;
  apiKey?: string;
}

export interface ResolvedProject {
  projectId: string;
  localBrainPath: string;
  repository: string;
  gitRoot: string;
  currentBranch: string;
  currentCommit: string;
  brainMode: BrainMode;
  apiBaseUrl?: string;
  apiKey?: string;
}

export interface ProjectContext {
  projectId: string;
  name: string;
  objectiveTitle: string;
  scope: string;
  outOfScope: string[];
  architecture: string[];
  recentDecisions: string[];
  priorHandoff: string;
  validation: string[];
  stopConditions: string[];
  activeSlice: string;
}

export interface Objective {
  objectiveId: string;
  projectId: string;
  title: string;
  scope: string;
  outOfScope: string[];
  validation: string[];
  stopConditions: string[];
  activeSlice: string;
  status: string;
  priority: string;
}

export interface SessionRecord {
  sessionId: string;
  projectId: string;
  objectiveId?: string;
  parentSessionId?: string;
  workerId?: string;
  agentRole?: 'supervisor' | 'worker';
  repository: string;
  branch: string;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'completed' | 'blocked' | 'paused' | 'failed';
  eventCount: number;
}

export interface SessionEvent {
  type: string;
  sessionId: string;
  timestamp: string;
  command?: string;
  result?: string;
  exitCode?: number | null;
  filePath?: string;
  decision?: string;
  reason?: string;
  impact?: string;
  branch?: string;
  details?: Record<string, unknown>;
}

export interface HandoffRecord {
  sessionId: string;
  projectId: string;
  objectiveId: string;
  status: 'completed' | 'blocked' | 'paused' | 'failed';
  summary: string;
  changedFiles: string[];
  validation?: { command: string; status: 'passed' | 'failed' | 'skipped' }[];
  decisions?: { decision: string; reason: string }[];
  blockers: { blocker: string; impact?: string }[];
  nextRecommendedAction?: string;
}

export interface Blocker {
  blocker: string;
  impact?: string;
}

export interface DelegationRecord {
  delegationId: string;
  parentSessionId: string;
  childSessionId: string;
  delegatedBy: string;
  assignedTo: string;
  task: string;
  contextSnapshot: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface FileConflictRecord {
  filePath: string;
  sessions: string[];
  workerIds: string[];
  detectedAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface ConsolidatedHandoffRecord {
  parentSessionId: string;
  childHandoffIds: string[];
  projectId: string;
  objectiveId: string;
  status: 'completed' | 'blocked' | 'paused' | 'failed';
  summary: string;
  consolidatedChangedFiles: string[];
  consolidatedValidation: { command: string; status: 'passed' | 'failed' | 'skipped' }[];
  consolidatedDecisions: { decision: string; reason: string }[];
  consolidatedBlockers: { blocker: string; impact?: string }[];
  openItems: string[];
  nextRecommendedAction: string;
}

export interface SessionTreeNode {
  sessionId: string;
  workerId?: string;
  agentRole?: 'supervisor' | 'worker';
  status: string;
  children: SessionTreeNode[];
}
