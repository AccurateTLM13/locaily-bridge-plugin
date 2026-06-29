import { requireSession } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createCheckConflictsTool(): ToolDefinition {
  return {
    name: 'locaily_check_conflicts',
    description:
      'Detects conflicting file changes between multiple active sessions or worker agents. Call this to identify files that have been modified by more than one session, which may require manual resolution before consolidation.',
    parameters: {
      type: 'object',
      properties: {
        sessionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of session IDs to check for conflicts. If empty, checks all active sessions for the project.',
        },
      },
      required: [],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const session = requireSession();

      const explicitSessionIds = args.sessionIds as string[] | undefined;

      let sessionIds: string[];
      if (explicitSessionIds && Array.isArray(explicitSessionIds) && explicitSessionIds.length > 0) {
        sessionIds = explicitSessionIds;
      } else {
        const allSessions = await session.client.listSessions(session.project.projectId);
        sessionIds = allSessions
          .filter((s) => s.status === 'active' || s.status === 'completed')
          .map((s) => s.sessionId);

        if (sessionIds.length === 0) {
          return 'No sessions found to check for conflicts.';
        }
      }

      const conflicts = await session.conflictDetector.detectConflicts(sessionIds);

      if (conflicts.length === 0) {
        return 'No file conflicts detected between the checked sessions.';
      }

      let msg = `Found ${conflicts.length} file conflict(s):\n\n`;

      for (const conflict of conflicts) {
        msg += `  File: ${conflict.filePath}\n`;
        msg += `  Sessions involved: ${conflict.sessions.join(', ')}\n`;
        if (conflict.workerIds.length > 0) {
          msg += `  Workers involved: ${conflict.workerIds.join(', ')}\n`;
        }
        msg += `  Detected at: ${conflict.detectedAt}\n`;
        msg += `  Status: ${conflict.status}\n\n`;
      }

      msg += 'Recommendation: Review the conflicting files and resolve conflicts before submitting a consolidated handoff.';
      msg += '\nUse locaily_consolidate_handoffs after resolving conflicts.';

      return msg;
    },
  };
}
