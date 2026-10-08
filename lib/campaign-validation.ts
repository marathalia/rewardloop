// Check customer-facing copy separately from internal rationale and art direction.
const copyFields = ["headline", "posterKicker", "posterBadge", "inApp", "push", "sms", "emailSubject", "emailBody", "cta"] as const

function amounts(text: string) {
  return [...text.matchAll(/(?:S\$|SGD\s*|\$)\s*(\d+(?:,\d{3})*(?:\.\d+)?)(\s*(?:\/|per\s+)(?:day|month|year))?/gi)]
    .map(match => `${Number(match[1].replaceAll(",", ""))}:${(match[2] ?? "").replace(/\s|per|\//gi, "").toLowerCase()}`)
}

export function campaignValidationIssues(content: Record<string, string>, allowedValue: string): string[] {
  const issues: string[] = []
  const allowedAmounts = new Set(amounts(allowedValue))
  const allowedPercentages = new Set([...allowedValue.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map(match => Number(match[1])))
  for (const field of copyFields) {
    const text = content[field] ?? ""
    if (!text.trim()) issues.push(`${field}: text is required.`)
    if (/\b(?:partner[-\s]?funded|rewardloop[-\s]?funded|funding|funded by|sponsorship)\b/i.test(text)) {
      issues.push(`${field}: remove funding or sponsorship references.`)
    }
    if (amounts(text).some(amount => !allowedAmounts.has(amount))) {
      issues.push(`${field}: use only the catalogue amount and its stated unit (${allowedValue}).`)
    }
    if ([...text.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].some(match => !allowedPercentages.has(Number(match[1])))) {
      issues.push(`${field}: remove unapproved percentage claims.`)
    }
  }
  return issues
}
