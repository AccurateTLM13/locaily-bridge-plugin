import { resolveProject } from '../project/resolve-project.js';
import { createBrainClient } from '../brain/client-factory.js';
import { buildContextPackage } from '../context/build-context.js';
import { initSession, setContextForGuardrails } from '../sessions/session-manager.js';
import type { ProjectContext } from '../config/schema.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

export function createProjectContextTool(): ToolDefinition {
  return {
    name: 'locaily_project_context',
    description:
      'Returns the active LocAIly project context including objective, scope, constraints, validation requirements, recent decisions, and stop conditions. Call this at session start and anytime you need to reorient.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    async handler(_args: Record<string, unknown>): Promise<string> {
      const cwd = process.cwd();
      const project = resolveProject(cwd);
      const client = createBrainClient(project);
      const context: ProjectContext = await client.getProjectContext();

      initSession(project, context.objectiveTitle !== 'No active objective' ? undefined : undefined);
      setContextForGuardrails(context);

      const pkg = buildContextPackage(context);
      return pkg.markdown;
    },
  };
}
