import type { HandoffRecord, ProjectContext } from '../config/schema.js';
import type { LocalBrainClient } from '../brain/client.js';
import { buildHandoff, type HandoffInput } from './build-handoff.js';
import { verifyHandoff, type VerificationResult } from './verify-handoff.js';
import type { EvidenceStore } from '../observer/evidence-store.js';
import { GuardrailEngine, formatGuardrailReport, type GuardrailReport } from '../guardrails/index.js';

export interface SubmitHandoffResult {
  handoffId: string;
  verification: VerificationResult;
  guardrails: GuardrailReport;
  warnings: string[];
  errors: string[];
  blocked: boolean;
}

export async function submitHandoff(
  client: LocalBrainClient,
  sessionId: string,
  projectId: string,
  objectiveId: string,
  input: HandoffInput,
  evidence?: EvidenceStore,
  guardrails?: GuardrailEngine,
  context?: ProjectContext,
  brainReachable?: boolean
): Promise<SubmitHandoffResult> {
  const handoff = buildHandoff(sessionId, projectId, objectiveId, input);
  const verification = verifyHandoff(handoff, evidence);

  const warnings = [...verification.warnings];
  const errors = [...verification.errors];
  let blocked = !verification.valid;

  let guardrailReport: GuardrailReport = {
    passed: true,
    results: [],
    warnings: [],
    blocks: [],
  };

  if (guardrails && context) {
    guardrailReport = guardrails.checkAll(handoff, context, {
      evidence,
      brainReachable,
    });

    warnings.push(...guardrailReport.warnings.map((r) => r.message));
    errors.push(...guardrailReport.blocks.map((r) => r.message));
    if (!guardrailReport.passed) {
      blocked = true;
    }
  }

  if (!blocked) {
    await client.submitHandoff(handoff);
  }

  return {
    handoffId: handoff.sessionId,
    verification,
    guardrails: guardrailReport,
    warnings,
    errors,
    blocked,
  };
}
