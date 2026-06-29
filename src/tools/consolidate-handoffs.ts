import { requireSession } from '../sessions/session-manager.js';
import { consolidateHandoffs } from '../handoff/consolidated-handoff.js';
import { submitHandoff } from '../handoff/submit-handoff.js';
import type { ToolDefinition } from './project-context.js';

export function createConsolidateHandoffsTool(): ToolDefinition {
  return {
    name: 'locaily_consolidate_handoffs',
    description:
      'Consolidates handoffs from multiple child worker sessions into a single supervisor handoff. Call this after all delegated workers have completed their sessions and submitted individual handoffs. Produces a consolidated view of all changes, validations, decisions, and blockers.',
    parameters: {
      type: 'object',
      properties: {
        childSessionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of child session IDs whose handoffs should be consolidated.',
        },
        summary: {
          type: 'string',
          description: '1-3 sentence summary of the consolidated work across all child sessions.',
        },
        openItems: {
          type: 'array',
          items: { type: 'string' },
          description: 'Items that remain open or incomplete across the delegated work.',
        },
        nextRecommendedAction: {
          type: 'string',
          description: 'Suggested next step after consolidation.',
        },
      },
      required: ['childSessionIds', 'summary', 'openItems'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const childSessionIds = args.childSessionIds as string[];
      const summary = args.summary as string;
      const openItems = args.openItems as string[];
      const nextRecommendedAction = args.nextRecommendedAction as string | undefined;

      if (!Array.isArray(childSessionIds) || childSessionIds.length === 0) {
        return 'Error: "childSessionIds" must be a non-empty array of session IDs.';
      }
      if (!summary || typeof summary !== 'string') {
        return 'Error: "summary" parameter is required and must be a string.';
      }
      if (!Array.isArray(openItems)) {
        return 'Error: "openItems" must be an array.';
      }

      const session = requireSession();

      const childHandoffs = [];
      for (const childId of childSessionIds) {
        try {
          const handoff = await session.client.getHandoff(childId);
          childHandoffs.push(handoff);
        } catch (err) {
          return `Error: No handoff found for child session "${childId}". Ask the worker to submit their handoff first.`;
        }
      }

      let objectiveId = '';
      try {
        const objective = await session.client.getActiveObjective();
        objectiveId = objective.objectiveId;
      } catch {
        objectiveId = 'unknown';
      }

      const consolidated = consolidateHandoffs(
        session.sessionId,
        session.project.projectId,
        objectiveId,
        {
          childHandoffs,
          summary,
          openItems,
          nextRecommendedAction: nextRecommendedAction || '',
        }
      );

      const result = await submitHandoff(
        session.client,
        session.sessionId,
        session.project.projectId,
        objectiveId,
        {
          status: consolidated.status,
          summary: consolidated.summary,
          changedFiles: consolidated.consolidatedChangedFiles,
          validation: consolidated.consolidatedValidation,
          decisions: consolidated.consolidatedDecisions,
          blockers: consolidated.consolidatedBlockers,
          nextRecommendedAction: consolidated.nextRecommendedAction,
        },
        session.observer.evidence,
        session.guardrails,
        undefined,
        true
      );

      if (result.blocked) {
        let msg = 'Consolidated handoff BLOCKED:\n';
        for (const err of result.errors) {
          msg += `  - ${err}\n`;
        }
        return msg;
      }

      let msg = `Consolidated handoff submitted (session: ${result.handoffId}).\n`;
      msg += `  Child sessions consolidated: ${childSessionIds.length}\n`;
      msg += `  Status: ${consolidated.status}\n`;
      msg += `  Total files changed: ${consolidated.consolidatedChangedFiles.length}\n`;
      msg += `  Total validations: ${consolidated.consolidatedValidation.length}\n`;
      msg += `  Total decisions: ${consolidated.consolidatedDecisions.length}\n`;
      msg += `  Total blockers: ${consolidated.consolidatedBlockers.length}\n`;
      msg += `  Open items: ${openItems.length}\n`;

      if (result.warnings.length > 0) {
        msg += `\nWarnings:\n${result.warnings.map((w) => `  - ${w}`).join('\n')}`;
      }

      return msg;
    },
  };
}
