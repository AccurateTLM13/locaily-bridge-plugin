import { createProjectContextTool } from './tools/project-context.js';
import { createReportProgressTool } from './tools/report-progress.js';
import { createReportDecisionTool } from './tools/report-decision.js';
import { createReportBlockerTool } from './tools/report-blocker.js';
import { createSubmitHandoffTool } from './tools/submit-handoff.js';
import { createRecordValidationTool } from './tools/record-validation.js';
import { createDelegateTaskTool } from './tools/delegate-task.js';
import { createConsolidateHandoffsTool } from './tools/consolidate-handoffs.js';
import { createCheckConflictsTool } from './tools/check-conflicts.js';
import type { ToolDefinition } from './tools/project-context.js';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  tools: ToolDefinition[];
}

export function createPlugin(): PluginManifest {
  return {
    name: 'locaily-bridge-plugin',
    version: '0.1.0',
    description: 'Connects OpenCode sessions to the LocAIly Local Brain',
    tools: [
      createProjectContextTool(),
      createReportProgressTool(),
      createReportDecisionTool(),
      createReportBlockerTool(),
      createRecordValidationTool(),
      createSubmitHandoffTool(),
      createDelegateTaskTool(),
      createConsolidateHandoffsTool(),
      createCheckConflictsTool(),
    ],
  };
}

export const tools = [
  createProjectContextTool(),
  createReportProgressTool(),
  createReportDecisionTool(),
  createReportBlockerTool(),
  createRecordValidationTool(),
  createSubmitHandoffTool(),
  createDelegateTaskTool(),
  createConsolidateHandoffsTool(),
  createCheckConflictsTool(),
];

export default createPlugin;
