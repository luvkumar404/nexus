# Rules and Scoring

The audit engine is rule-based. It currently contains 251 rules across 20 categories.

## Categories and Weights

| Category | Weight |
|---|---:|
| Core SEO | 12 |
| Performance | 12 |
| Links | 8 |
| Images | 8 |
| Security | 8 |
| Technical SEO | 7 |
| Crawlability | 5 |
| Structured Data | 5 |
| Content | 5 |
| JavaScript Rendering | 5 |
| Accessibility | 4 |
| Social | 3 |
| E-E-A-T | 3 |
| URL Structure | 3 |
| Redirects | 3 |
| Mobile | 2 |
| Internationalization | 2 |
| HTML Validation | 2 |
| AI/GEO Readiness | 2 |
| Legal Compliance | 1 |

Weights are configured in:

```text
server/src/config/categoryWeights.config.js
```

Rules are loaded from:

```text
server/src/config/auditRules.config.js
server/src/services/rules/
```

## Rule Result Status

Each rule returns one status:

| Status | Score | Score Eligible | Meaning |
|---|---:|---:|---|
| `pass` | 100 | yes | Check passed |
| `warn` | 50 | yes | Check needs improvement |
| `fail` | 0 | yes | Confirmed issue |
| `info` | null | no | Informational only |
| `not_available` | null | no | Required data source is missing |
| `skipped` | null | no | Rule was intentionally skipped for this audit mode |

## Severity

Severity is separate from status.

Allowed severities:

- `critical`
- `high`
- `medium`
- `low`
- `info`

Example: a rule can have `status: "not_available"` and `severity: "info"`. The frontend should not treat that as a warning.

## Rule Result Shape

```json
{
  "ruleId": "perf-lcp",
  "ruleName": "LCP",
  "categoryId": "performance",
  "status": "not_available",
  "score": null,
  "severity": "medium",
  "message": "Performance audit is unavailable because the browser dependency is missing.",
  "recommendation": "Run `npx playwright install chromium` in the backend project, or disable Lighthouse checks using LIGHTHOUSE_ENABLED=false.",
  "evidence": {
    "reason": "PLAYWRIGHT_BROWSER_MISSING",
    "command": "npx playwright install chromium"
  },
  "affectedUrl": "https://example.com",
  "impact": "medium",
  "difficulty": "easy",
  "source": "lighthouse",
  "confidence": "high",
  "scoreEligible": false
}
```

## Category Score

Only score-eligible rules count:

```js
eligible = rules.filter(rule =>
  ["pass", "warn", "fail"].includes(rule.status)
)
```

If there are no eligible rules:

```js
category.score = null
```

Otherwise:

```js
category.score = average(eligible.rule.score)
```

## Overall Score

Only categories with a non-null score count.

Weights are re-normalized across available categories:

```js
available = categories.filter(category => category.score !== null)
totalWeight = sum(available.weight)
overall = sum(category.score * (category.weight / totalWeight))
```

This means a missing Lighthouse audit does not reduce the overall SEO score.

## Grade

| Score | Grade | Meaning |
|---:|---|---|
| 90-100 | A | Excellent |
| 70-89 | B | Good |
| 50-69 | C | Needs Work |
| 0-49 | D/F | Poor |
| null | NA | Not Available |

## Not Available Rules

Rules should return `not_available` when they require data that is not available.

Examples:

- Lighthouse failed
- Playwright browser is missing
- Crawl mode is required
- Rendered DOM comparison is not enabled
- SSL expiry inspection is not available
- External URL validation timed out

Not available rules do not count as warnings or failures.
