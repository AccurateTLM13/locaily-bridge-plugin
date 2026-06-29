import {
  requireSession,
  getSession,
  closeSession,
} from '../sessions/session-manager.js';
import { submitHandoff } from '../handoff/submit-handoff.js';
import { formatGuardrailReport } from '../guardrails/index.js';
import type { ToolDefinition } from './project-context.js';

export function createSubmitHandoffTool(): ToolDefinition {
  return {
    name: 'locaily_submit_handoff',
    description:
      'Closes the work session and updates the Local Brain with a structured handoff. Call when the agent has completed (or must stop) the current objective.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['completed', 'blocked', 'paused', 'failed'],
          description: 'Outcome status of the session.',
        },
        summary: {
          type: 'string',
          description: '1-3 sentence summary of work completed.',
        },
        changedFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of files changed during the session.',
        },
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              command: { type: 'string' },
              status: { type: 'string', enum: ['passed', 'failed', 'skipped'] },
            },
            required: ['command', 'status'],
          },
          description: 'Validation commands run and their results.',
        },
        decisions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              decision: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['decision', 'reason'],
          },
          description: 'Design decisions made during the session.',
        },
        blockers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              blocker: { type: 'string' },
              impact: { type: 'string' },
            },
            required: ['blocker'],
          },
          description: 'Blockers encountered. Empty array if none.',
        },
        nextRecommendedAction: {
          type: 'string',
          description: 'Suggested next step for the next agent or session.',
        },
      },
      required: ['status', 'summary', 'changedFiles', 'blockers'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const status = args.status as string;
      const summary = args.summary as string;
      const changedFiles = args.changedFiles as string[];
      const validation = args.validation as
        | { command: string; status: 'passed' | 'failed' | 'skipped' }[]
        | undefined;
      const decisions = args.decisions as
        | { decision: string; reason: string }[]
        | undefined;
      const blockers = args.blockers as { blocker: string; impact?: string }[];
      const nextRecommendedAction = args.nextRecommendedAction as string | undefined;

      const validStatuses = ['completed', 'blocked', 'paused', 'failed'];
      if (!status || !validStatuses.includes(status)) {
        return `Error: "status" must be one of: ${validStatuses.join(', ')}.`;
      }

      requireSession();

      const session = getSession();
      if (!session) {
        return 'Error: no active session.';
      }

      let objectiveId = '';
      let context;
      try {
        const objective = await session.client.getActiveObjective();
        objectiveId = objective.objectiveId;
        context = await session.client.getProjectContext();
      } catch {
        objectiveId = 'unknown';
      }

      let brainReachable = true;
      try {
        await session.client.resolveProject();
      } catch {
        brainReachable = false;
      }

      const result = await submitHandoff(
        session.client,
        session.sessionId,
        session.project.projectId,
        objectiveId,
        {
          status: status as 'completed' | 'blocked' | 'paused' | 'failed',
          summary: summary || '',
          changedFiles: changedFiles || [],
          validation,
          decisions,
          blockers: blockers || [],
          nextRecommendedAction,
        },
        session.observer.evidence,
        session.guardrails,
        context,
        brainReachable
      );

      if (result.blocked) {
        const parts: string[] = ['Handoff submission BLOCKED:'];
        if (result.errors.length > 0) {
          parts.push(...result.errors.map((e) => `  - ${e}`));
        }
        const guardrailText = formatGuardrailReport(result.guardrails);
        if (guardrailText) parts.push('', guardrailText);
        return parts.join('\n');
      }

      await closeSession(status as 'completed' | 'blocked' | 'paused' | 'failed');

      let response = `Handoff submitted (session: ${result.handoffId}). Session closed with status: ${status}.`;
      if (result.warnings.length > 0) {
        response += `\nWarnings:\n${result.warnings.map((w) => `  - ${w}`).join('\n')}`;
      }

      return response;
    },
  };
}
