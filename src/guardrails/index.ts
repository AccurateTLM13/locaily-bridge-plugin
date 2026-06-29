import type { HandoffRecord, ProjectContext } from '../config/schema.js';
import type { EvidenceStore } from '../observer/evidence-store.js';

export type GuardrailSeverity = 'info' | 'warn' | 'block';

export interface GuardrailResult {
  rule: string;
  severity: GuardrailSeverity;
  message: string;
}

export interface GuardrailReport {
  passed: boolean;
  results: GuardrailResult[];
  warnings: GuardrailResult[];
  blocks: GuardrailResult[];
}

export class GuardrailEngine {
  private context?: ProjectContext;
  private contextLoadedAt: number = 0;
  private scopeViolations: string[] = [];

  setContext(context: ProjectContext): void {
    this.context = context;
    this.contextLoadedAt = Date.now();
  }

  getContextAge(): number {
    if (this.contextLoadedAt === 0) return 0;
    return Date.now() - this.contextLoadedAt;
  }

  recordScopeViolation(violation: string): void {
    this.scopeViolations.push(violation);
  }

  getScopeViolations(): string[] {
    return [...this.scopeViolations];
  }

  checkScopeViolation(
    action: string,
    context?: ProjectContext
  ): GuardrailResult | null {
    const ctx = context ?? this.context;
    if (!ctx || ctx.outOfScope.length === 0) return null;

    const lowerAction = action.toLowerCase();
    for (const outOfScope of ctx.outOfScope) {
      const lowerOutOfScope = outOfScope.toLowerCase();
      const keywords = lowerOutOfScope.split(/\s+/);
      const matchCount = keywords.filter((kw) => lowerAction.includes(kw)).length;
      if (matchCount >= 2) {
        return {
          rule: 'work-within-slice-scope',
          severity: 'warn',
          message: `Work may be outside the active slice scope: "${action}" appears related to "${outOfScope}". Confirm this is intentional.`,
        };
      }
    }
    return null;
  }

  checkValidationEvidence(
    handoff: HandoffRecord,
    context: ProjectContext,
    evidence?: EvidenceStore
  ): GuardrailResult[] {
    const results: GuardrailResult[] = [];

    if (handoff.status !== 'completed') return results;

    if (context.validation.length === 0) return results;

    for (const required of context.validation) {
      const handoffMatch = handoff.validation?.find(
        (v) => v.command === required && v.status === 'passed'
      );

      if (!handoffMatch) {
        const evidenceMatch = evidence?.hasValidationPassed(required);
        if (evidenceMatch) {
          results.push({
            rule: 'validation-evidence-matches',
            severity: 'info',
            message: `Validation "${required}" passed (recorded in evidence) but not listed in handoff validation array.`,
          });
        } else {
          results.push({
            rule: 'validation-evidence-matches',
            severity: 'block',
            message: `"${required}" is required by the active build slice but no successful run was recorded. Handoff blocked.`,
          });
        }
      }
    }

    return results;
  }

  checkUnreportedChanges(
    handoff: HandoffRecord,
    evidence?: EvidenceStore
  ): GuardrailResult[] {
    const results: GuardrailResult[] = [];

    if (!evidence) return results;

    const observedChanges = evidence.getFileChanges();
    for (const observed of observedChanges) {
      const reported = handoff.changedFiles.some(
        (f) => f.includes(observed) || observed.includes(f)
      );
      if (!reported) {
        results.push({
          rule: 'all-changed-files-reported',
          severity: 'warn',
          message: `File "${observed}" was changed (observed by file watcher) but not listed in the handoff.`,
        });
      }
    }

    return results;
  }

  checkStaleContext(handoff: HandoffRecord): GuardrailResult[] {
    const results: GuardrailResult[] = [];
    const age = this.getContextAge();

    if (age === 0) return results;

    const ageMinutes = Math.floor(age / 60000);
    if (ageMinutes >= 30) {
      results.push({
        rule: 'stale-context-detection',
        severity: 'warn',
        message: `Context was loaded ${ageMinutes} minutes ago. Consider refreshing with locaily_project_context before submitting the handoff.`,
      });
    }

    return results;
  }

  checkObjectiveConflict(handoff: HandoffRecord): GuardrailResult[] {
    const results: GuardrailResult[] = [];

    if (!this.context) return results;

    if (
      this.context.objectiveTitle &&
      handoff.objectiveId === 'unknown' &&
      this.context.objectiveTitle !== 'No active objective'
    ) {
      results.push({
        rule: 'objective-conflict-detection',
        severity: 'warn',
        message: `Handoff has objectiveId "unknown" but the active objective is "${this.context.objectiveTitle}". The objective may have changed since context was loaded.`,
      });
    }

    return results;
  }

  checkBrainReachable(reachable: boolean): GuardrailResult[] {
    const results: GuardrailResult[] = [];

    if (!reachable) {
      results.push({
        rule: 'brain-reachable',
        severity: 'warn',
        message: 'Local Brain is unreachable. Handoff will not be persisted to Local Brain.',
      });
    }

    return results;
  }

  checkAll(
    handoff: HandoffRecord,
    context: ProjectContext,
    options: {
      evidence?: EvidenceStore;
      brainReachable?: boolean;
    } = {}
  ): GuardrailReport {
    const results: GuardrailResult[] = [];
    const warnings: GuardrailResult[] = [];
    const blocks: GuardrailResult[] = [];

    results.push(...this.checkValidationEvidence(handoff, context, options.evidence));
    results.push(...this.checkUnreportedChanges(handoff, options.evidence));
    results.push(...this.checkStaleContext(handoff));
    results.push(...this.checkObjectiveConflict(handoff));

    if (options.brainReachable !== undefined) {
      results.push(...this.checkBrainReachable(options.brainReachable));
    }

    for (const r of results) {
      if (r.severity === 'block') blocks.push(r);
      else if (r.severity === 'warn') warnings.push(r);
    }

    return {
      passed: blocks.length === 0,
      results,
      warnings,
      blocks,
    };
  }
}

export function formatGuardrailReport(report: GuardrailReport): string {
  const parts: string[] = [];

  if (report.warnings.length > 0) {
    parts.push('Guardrail Warnings:');
    for (const w of report.warnings) {
      parts.push(`  [warn] ${w.message}`);
    }
    parts.push('');
  }

  if (report.blocks.length > 0) {
    parts.push('Guardrail Blocks:');
    for (const b of report.blocks) {
      parts.push(`  [block] ${b.message}`);
    }
    parts.push('');
  }

  if (report.passed && report.warnings.length === 0) {
    parts.push('All guardrail checks passed.');
  }

  return parts.join('\n');
}
