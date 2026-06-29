import type { ProjectContext } from '../config/schema.js';
import { enforceBudget } from './context-budget.js';

export interface ContextPackage {
  markdown: string;
  truncated: boolean;
  source: ProjectContext;
}

export function buildContextPackage(context: ProjectContext): ContextPackage {
  const lines: string[] = [];

  lines.push('# Current Project Context');
  lines.push('');
  lines.push('## Project');
  lines.push(`${context.name} (${context.projectId})`);
  lines.push('');

  lines.push('## Objective');
  lines.push(context.objectiveTitle);
  lines.push('');

  lines.push('## Scope');
  lines.push(context.scope || 'Not specified.');
  lines.push('');

  if (context.outOfScope.length > 0) {
    lines.push('## Constraints');
    for (const item of context.outOfScope) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  if (context.architecture.length > 0) {
    lines.push('## Architecture');
    for (const item of context.architecture.slice(0, 5)) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  if (context.recentDecisions.length > 0) {
    lines.push('## Recent Decisions');
    for (const decision of context.recentDecisions.slice(0, 5)) {
      lines.push(`- ${decision}`);
    }
    lines.push('');
  }

  if (context.priorHandoff) {
    lines.push('## Prior Handoff');
    lines.push(context.priorHandoff);
    lines.push('');
  }

  if (context.validation.length > 0) {
    lines.push('## Validation Requirements');
    for (const v of context.validation) {
      lines.push(`- ${v}`);
    }
    lines.push('');
  }

  if (context.stopConditions.length > 0) {
    lines.push('## Stop Conditions');
    for (const s of context.stopConditions) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  const markdown = lines.join('\n');

  const { text, truncated } = enforceBudget(markdown);

  return {
    markdown: text,
    truncated,
    source: context,
  };
}
