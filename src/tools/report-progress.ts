import { requireSession, getSession, recordProgressEvent } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createReportProgressTool(): ToolDefinition {
  return {
    name: 'locaily_report_progress',
    description:
      'Records meaningful progress during the session. Call after completing a discrete unit of work (file written, component built, test passing).',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Description of the progress made.',
        },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files involved in this progress.',
        },
      },
      required: ['summary'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const summary = args.summary as string;
      if (!summary || typeof summary !== 'string') {
        return 'Error: "summary" parameter is required and must be a string.';
      }

      const session = getSession();

      if (session) {
        const scopeWarning = session.guardrails.checkScopeViolation(summary);
        if (scopeWarning) {
          session.guardrails.recordScopeViolation(scopeWarning.message);
        }
      }

      requireSession();

      const files = Array.isArray(args.files)
        ? (args.files as string[])
        : undefined;

      const eventId = recordProgressEvent(summary, files);

      let msg = `Progress recorded (event: ${eventId}): ${summary}`;
      if (session) {
        const scopeWarning = session.guardrails.checkScopeViolation(summary);
        if (scopeWarning) {
          msg += `\n[guardrail] ${scopeWarning.message}`;
        }
      }

      return msg;
    },
  };
}
