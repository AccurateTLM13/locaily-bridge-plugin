import { requireSession, initChildSession } from '../sessions/session-manager.js';
import type { ToolDefinition } from './project-context.js';

export function createDelegateTaskTool(): ToolDefinition {
  return {
    name: 'locaily_delegate_task',
    description:
      'Delegates a task to a worker agent by creating a child session. The worker agent receives a context snapshot and the delegated task description. Use this for multi-agent workflows where a supervisor assigns work to a worker.',
    parameters: {
      type: 'object',
      properties: {
        workerId: {
          type: 'string',
          description: 'Identifier for the worker agent that will perform the task.',
        },
        task: {
          type: 'string',
          description: 'Description of the task to be delegated.',
        },
        contextSnapshot: {
          type: 'string',
          description: 'Current context snapshot to pass to the worker.',
        },
      },
      required: ['workerId', 'task', 'contextSnapshot'],
    },
    async handler(args: Record<string, unknown>): Promise<string> {
      const workerId = args.workerId as string;
      const task = args.task as string;
      const contextSnapshot = args.contextSnapshot as string;

      if (!workerId || typeof workerId !== 'string') {
        return 'Error: "workerId" parameter is required and must be a string.';
      }
      if (!task || typeof task !== 'string') {
        return 'Error: "task" parameter is required and must be a string.';
      }
      if (!contextSnapshot || typeof contextSnapshot !== 'string') {
        return 'Error: "contextSnapshot" parameter is required and must be a string.';
      }

      const session = requireSession();

      const childSessionId = initChildSession({
        parentSessionId: session.sessionId,
        workerId,
        task,
        contextSnapshot,
      });

      const delegations = await session.delegationTracker.getActiveDelegations(session.sessionId);
      const delegation = delegations.find((d) => d.childSessionId === childSessionId);

      let msg = `Task delegated to worker "${workerId}".\n`;
      msg += `  Child session: ${childSessionId}\n`;
      msg += `  Task: ${task}\n`;
      msg += `  Parent session: ${session.sessionId}\n`;
      if (delegation) {
        msg += `  Delegation ID: ${delegation.delegationId}\n`;
      }
      msg += `\nThe worker agent should call locaily_project_context to begin work on this task.`;
      msg += `\nUse locaily_check_conflicts to detect file conflicts between concurrent workers.`;

      return msg;
    },
  };
}
