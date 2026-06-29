import { requireSession, getSession, recordDecisionEvent } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createReportDecisionTool(): ToolDefinition {
  return {
    name: 'locaily_report_decision',
    description:
      'Records a development decision. Call when making scope-affecting or architectural choices.',
    parameters: {
      type: 'object',
      properties: {
        decision: {
          type: 'string',
          description: 'The decision that was made.',
        },
        reason: {
          type: 'string',
          description: 'The reason for the decision.',
        },
      },
      required: ['decision', 'reason'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const decision = args.decision as string;
      const reason = args.reason as string;

      if (!decision || typeof decision !== 'string') {
        return 'Error: "decision" parameter is required and must be a string.';
      }
      if (!reason || typeof reason !== 'string') {
        return 'Error: "reason" parameter is required and must be a string.';
      }

      const session = getSession();

      if (session) {
        const scopeWarning = session.guardrails.checkScopeViolation(decision);
        if (scopeWarning) {
          session.guardrails.recordScopeViolation(scopeWarning.message);
        }
      }

      requireSession();

      const eventId = recordDecisionEvent(decision, reason);

      let msg = `Decision recorded (event: ${eventId}): ${decision}`;
      if (session) {
        const scopeWarning = session.guardrails.checkScopeViolation(decision);
        if (scopeWarning) {
          msg += `\n[guardrail] ${scopeWarning.message}`;
        }
      }

      return msg;
    },
  };
}
