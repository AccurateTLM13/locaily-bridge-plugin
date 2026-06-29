import type { HandoffRecord } from '../config/schema.js';
import type { EvidenceStore } from '../observer/evidence-store.js';

export interface VerificationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

const VALID_STATUSES = ['completed', 'blocked', 'paused', 'failed'];
const VALID_VALIDATION_STATUSES = ['passed', 'failed', 'skipped'];

export function verifyHandoff(
  handoff: HandoffRecord,
  evidence?: EvidenceStore
): VerificationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!handoff.sessionId) errors.push('sessionId is required.');
  if (!handoff.projectId) errors.push('projectId is required.');
  if (!handoff.objectiveId) errors.push('objectiveId is required.');

  if (!handoff.status) {
    errors.push('status is required.');
  } else if (!VALID_STATUSES.includes(handoff.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (!handoff.summary || handoff.summary.length < 10) {
    errors.push('summary is required and must be at least 10 characters.');
  }

  if (!Array.isArray(handoff.changedFiles)) {
    errors.push('changedFiles must be an array.');
  } else if (handoff.status === 'completed' && handoff.changedFiles.length === 0) {
    warnings.push('status is "completed" but no files were changed.');
  }

  if (handoff.status === 'completed' && !handoff.validation?.length) {
    warnings.push('status is "completed" but no validation results were reported.');
  }

  if (handoff.validation) {
    if (!Array.isArray(handoff.validation)) {
      errors.push('validation must be an array.');
    } else {
      for (let i = 0; i < handoff.validation.length; i++) {
        const v = handoff.validation[i];
        if (!v.command) errors.push(`validation[${i}]: command is required.`);
        if (!v.status || !VALID_VALIDATION_STATUSES.includes(v.status)) {
          errors.push(
            `validation[${i}]: status must be one of: ${VALID_VALIDATION_STATUSES.join(', ')}.`
          );
        }
      }
    }
  }

  if (!Array.isArray(handoff.blockers)) {
    errors.push('blockers must be an array.');
  } else {
    if (handoff.blockers.length > 0 && handoff.status === 'completed') {
      warnings.push('status is "completed" but blockers are reported.');
    }
  }

  if (handoff.decisions) {
    if (!Array.isArray(handoff.decisions)) {
      errors.push('decisions must be an array.');
    } else {
      for (let i = 0; i < handoff.decisions.length; i++) {
        const d = handoff.decisions[i];
        if (!d.decision) errors.push(`decisions[${i}]: decision is required.`);
        if (!d.reason) warnings.push(`decisions[${i}]: reason is recommended.`);
      }
    }
  }

  if (evidence) {
    crossCheckEvidence(handoff, evidence, warnings, errors);
  }

  return { valid: errors.length === 0, warnings, errors };
}

function crossCheckEvidence(
  handoff: HandoffRecord,
  evidence: EvidenceStore,
  warnings: string[],
  errors: string[]
): void {
  if (handoff.validation) {
    for (const v of handoff.validation) {
      if (v.status === 'passed') {
        const hasEvidence = evidence.hasValidationPassed(v.command);
        if (!hasEvidence) {
          warnings.push(
            `Validation "${v.command}" reported as passed, but no successful run was recorded in evidence.`
          );
        }
      }
    }
  }

  if (handoff.changedFiles && handoff.changedFiles.length > 0) {
    const observedChanges = evidence.getFileChanges();
    for (const file of handoff.changedFiles) {
      if (!evidence.hasFileChange(file)) {
        warnings.push(
          `File "${file}" is listed as changed but no file.changed event was recorded.`
        );
      }
    }
    for (const observed of observedChanges) {
      if (!handoff.changedFiles.some((f) => f.includes(observed) || observed.includes(f))) {
        warnings.push(
          `File "${observed}" was changed (observed) but not listed in the handoff.`
        );
      }
    }
  }

  if (handoff.blockers && handoff.blockers.length > 0) {
    const blockerCount = evidence.getBlockerCount();
    if (blockerCount === 0) {
      warnings.push(
        'Blockers reported in handoff but no blocker.encountered events were recorded.'
      );
    }
  }

  if (handoff.status === 'completed') {
    const validationResults = evidence.getValidationResults();
    if (validationResults.length === 0 && handoff.validation?.length) {
      errors.push(
        'status is "completed" but no validation evidence was recorded. Handoff blocked.'
      );
    }
  }
}
