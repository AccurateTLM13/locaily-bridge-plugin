import type { HandoffRecord, ConsolidatedHandoffRecord } from '../config/schema.js';
import { buildHandoff, type HandoffInput } from './build-handoff.js';

export interface ConsolidateInput {
  childHandoffs: HandoffRecord[];
  summary: string;
  openItems: string[];
  nextRecommendedAction: string;
}

export function consolidateHandoffs(
  parentSessionId: string,
  projectId: string,
  objectiveId: string,
  input: ConsolidateInput
): ConsolidatedHandoffRecord {
  const allChangedFiles = [
    ...new Set(input.childHandoffs.flatMap((h) => h.changedFiles)),
  ];

  const allValidation = input.childHandoffs.flatMap((h) => h.validation ?? []);

  const allDecisions = input.childHandoffs.flatMap((h) => h.decisions ?? []);

  const allBlockers = input.childHandoffs.flatMap((h) => h.blockers);

  const hasBlockers = allBlockers.length > 0;
  const allPassed = allValidation.every((v) => v.status === 'passed');
  const anyFailed = allValidation.some((v) => v.status === 'failed');

  let status: ConsolidatedHandoffRecord['status'] = 'completed';
  if (hasBlockers) status = 'blocked';
  if (anyFailed) status = 'failed';

  return {
    parentSessionId,
    childHandoffIds: input.childHandoffs.map((h) => h.sessionId),
    projectId,
    objectiveId,
    status,
    summary: input.summary,
    consolidatedChangedFiles: allChangedFiles,
    consolidatedValidation: allValidation,
    consolidatedDecisions: allDecisions,
    consolidatedBlockers: allBlockers,
    openItems: input.openItems,
    nextRecommendedAction: input.nextRecommendedAction,
  };
}

export function buildConsolidatedHandoffRecord(
  consolidated: ConsolidatedHandoffRecord
): HandoffRecord {
  return buildHandoff(
    consolidated.parentSessionId,
    consolidated.projectId,
    consolidated.objectiveId,
    {
      status: consolidated.status,
      summary: consolidated.summary,
      changedFiles: consolidated.consolidatedChangedFiles,
      validation: consolidated.consolidatedValidation,
      decisions: consolidated.consolidatedDecisions,
      blockers: consolidated.consolidatedBlockers,
      nextRecommendedAction: consolidated.nextRecommendedAction,
    }
  );
}
