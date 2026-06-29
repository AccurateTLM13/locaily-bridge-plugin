const DEFAULT_MAX_LENGTH = 4000;

export interface BudgetResult {
  text: string;
  truncated: boolean;
  originalLength: number;
}

export function enforceBudget(
  markdown: string,
  maxLength: number = DEFAULT_MAX_LENGTH
): BudgetResult {
  if (markdown.length <= maxLength) {
    return { text: markdown, truncated: false, originalLength: markdown.length };
  }

  const truncated = markdown.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = lastNewline > maxLength * 0.8 ? lastNewline : maxLength;

  return {
    text: markdown.substring(0, cutPoint) + '\n\n*(Context truncated due to size limit)*',
    truncated: true,
    originalLength: markdown.length,
  };
}
