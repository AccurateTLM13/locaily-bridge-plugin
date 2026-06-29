import { requireSession, recordValidationEvent } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createRecordValidationTool(): ToolDefinition {
  return {
    name: 'locaily_record_validation',
    description:
      'Records the result of a validation command (test, lint, build, etc.). Call after running any validation or build command to capture evidence for the handoff.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The validation command that was executed (e.g. "npm test").',
        },
        status: {
          type: 'string',
          enum: ['passed', 'failed', 'skipped'],
          description: 'Outcome of the validation.',
        },
        exitCode: {
          type: 'integer',
          description: 'Process exit code (0 = success, null if not available).',
        },
      },
      required: ['command', 'status'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const command = args.command as string;
      const status = args.status as 'passed' | 'failed' | 'skipped';
      const exitCode = args.exitCode !== undefined ? (args.exitCode as number | null) : null;

      if (!command || typeof command !== 'string') {
        return 'Error: "command" parameter is required and must be a string.';
      }
      if (!status || !['passed', 'failed', 'skipped'].includes(status)) {
        return 'Error: "status" must be one of: passed, failed, skipped.';
      }

      requireSession();

      const eventId = recordValidationEvent(command, status, exitCode);

      let msg = `Validation recorded (event: ${eventId}): "${command}" → ${status}`;
      if (exitCode !== null) msg += ` (exit code: ${exitCode})`;
      return msg;
    },
  };
}
