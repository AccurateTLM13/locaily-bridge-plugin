import type { HandoffRecord } from '../config/schema.js';

export interface HandoffInput {
  status: HandoffRecord['status'];
  summary: string;
  changedFiles: string[];
  validation?: { command: string; status: 'passed' | 'failed' | 'skipped' }[];
  decisions?: { decision: string; reason: string }[];
  blockers: { blocker: string; impact?: string }[];
  nextRecommendedAction?: string;
}

export function buildHandoff(
  sessionId: string,
  projectId: string,
  objectiveId: string,
  input: HandoffInput
): HandoffRecord {
  return {
    sessionId,
    projectId,
    objectiveId,
    status: input.status,
    summary: input.summary,
    changedFiles: input.changedFiles,
    validation: input.validation,
    decisions: input.decisions,
    blockers: input.blockers,
    nextRecommendedAction: input.nextRecommendedAction,
  };
}
