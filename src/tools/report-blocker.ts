import { requireSession, recordBlockerEvent, getSession } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createReportBlockerTool(): ToolDefinition {
  return {
    name: 'locaily_report_blocker',
    description:
      'Reports a blocker that prevents progress. Call when something prevents progress and the agent cannot resolve it.',
    parameters: {
      type: 'object',
      properties: {
        blocker: {
          type: 'string',
          description: 'Description of the blocker.',
        },
        impact: {
          type: 'string',
          description: 'What the blocker impacts.',
        },
      },
      required: ['blocker'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const blocker = args.blocker as string;
      const impact = args.impact as string | undefined;

      if (!blocker || typeof blocker !== 'string') {
        return 'Error: "blocker" parameter is required and must be a string.';
      }

      requireSession();

      const eventId = recordBlockerEvent(blocker, impact);

      const session = getSession();
      if (session) {
        await session.client.reportBlocker(session.sessionId, { blocker, impact });
      }

      let msg = `Blocker recorded (event: ${eventId}): ${blocker}`;
      if (impact) msg += ` (impact: ${impact})`;
      return msg;
    },
  };
}
