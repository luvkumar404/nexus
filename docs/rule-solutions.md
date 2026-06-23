# Audit Rules and Solution Generation

This document explains how Nexus SEO Auditor executes its 251 rules and creates actionable solutions from detected audit evidence.

## Overview

The audit contains 251 rules across 20 categories. Every rule always returns a result, but only `fail` and `warn` results receive a structured solution.

```text
Page fetch and site data
        ↓
HTML/context parser
        ↓
251 audit rules
        ↓
Rule status and evidence
        ↓
Deterministic recommendation generator
        ↓
Database and audit API
        ↓
Report “View Solution” interface
```

No AI API is required. Solutions are generated deterministically from the rule definition, its result, and crawler evidence.

## Rule Registry

The main registry is:

```text
server/src/config/auditRules.config.js
```

It combines the category files under:

```text
server/src/services/rules/
```

The 20 categories and weights are defined in:

```text
server/src/config/categoryWeights.config.js
```

Each configured rule has:

```js
{
  id: "core-description-present",
  name: "Meta Description Present",
  category: "core-seo",
  severity: "high",
  run: async (context) => { /* deterministic check */ }
}
```

Run this command from the repository root to verify the count:

```bash
node --input-type=module -e "import { AUDIT_RULES } from './server/src/config/auditRules.config.js'; console.log(AUDIT_RULES.length)"
```

The expected result is `251`.

## How Audit Evidence Is Collected

The crawler builds a shared context before running the rules. Depending on audit mode and availability, it can contain:

- Final URL, HTTP status, headers, timings, and redirect information
- Parsed title, description, canonical, robots directives, and viewport
- Heading hierarchy and visible text metrics
- Resolved links and image metadata
- CSS, JavaScript, and other resource information
- JSON-LD and other structured-data findings
- Open Graph and Twitter metadata
- `robots.txt` and sitemap results
- Multi-page crawl results
- Lighthouse metrics and opportunities
- Rendered-DOM information when available

Rules read only the context relevant to their check. A rule must not report a missing element unless its parser or data source confirms that condition.

Example result produced by a rule:

```js
{
  status: "fail",
  message: "Meta description is missing.",
  recommendation: "Add a concise meta description.",
  evidence: {
    selector: "meta[name=\"description\"]"
  },
  impact: "high",
  difficulty: "easy",
  source: "html",
  confidence: "high"
}
```

Relative resource URLs found in evidence are resolved against the audited final URL before they are displayed.

## Rule Statuses

| Status | Structured solution | Affects score |
|---|---:|---:|
| `pass` | No | Yes, score 100 |
| `warn` | Yes | Yes, score 50 |
| `fail` | Yes | Yes, score 0 |
| `info` | No | No |
| `not_available` | No | No |
| `skipped` | No | No |

`not_available` is used when the rule cannot obtain a required data source. `skipped` is used when the rule does not apply to the audited page or audit mode. Neither condition is converted into a warning or failure.

## Solution Generator

The generator is implemented in:

```text
server/src/services/recommendationGenerator.service.js
```

`runRulesEngine()` passes the completed rule result and audit context to `generateRecommendation()` before scoring and persistence.

The generator uses three layers:

1. **Exact rule guidance** for rules that require precise output, such as canonical tags, H1 tags, security headers, robots files, sitemaps, structured data, and social metadata.
2. **The rule's own detected message and recommendation**, which describe the exact condition evaluated by that rule.
3. **Category guidance** for impact, implementation workflow, verification approach, and safe fallback behavior.

This retains rule-specific information without duplicating crawler logic inside the recommendation layer.

### Generated Shape

The existing rule fields are preserved. A new `solution` object is added:

```js
{
  ruleId: "core-description-present",
  status: "failed",
  title: "Meta description is missing.",
  category: "Core SEO",
  priority: "high",
  impact: "Search engines may understand, index, or present this page less accurately.",
  detectedValue: {
    selector: "meta[name=\"description\"]"
  },
  expectedValue: "One relevant meta description approximately 120-160 characters long.",
  affectedItems: [
    "meta[name=\"description\"]"
  ],
  explanation: "Meta description is missing. The detected audit evidence is shown below.",
  solution: "Add a unique meta description inside the page head.",
  steps: [
    "Review the detected HTML signal and the audited final URL.",
    "Update the page template or page-level metadata with the expected value.",
    "Ensure only one authoritative value is emitted in the document head.",
    "Deploy the change and inspect the rendered HTML."
  ],
  codeExample: "<meta name=\"description\" content=\"A concise, accurate summary of this page.\">",
  verification: "Re-run the audit and confirm the rule passes.",
  estimatedEffort: "5-30 minutes"
}
```

`codeExample` is `null` when code would not be useful or could not be generated accurately.

## How Individual Fields Are Derived

| Field | Source |
|---|---|
| `ruleId` | Registered rule ID |
| `status` | Normalized from `fail` or `warn` |
| `title` | Rule result message |
| `category` | Category configuration |
| `priority` | Rule severity and status |
| `impact` | Category-specific impact guidance |
| `detectedValue` | Actual rule evidence |
| `expectedValue` | Exact rule override, rule recommendation, or category condition |
| `affectedItems` | Evidence URLs, images, links, selectors, resources, or audited URL |
| `explanation` | Result message plus evidence availability |
| `solution` | Exact rule override or rule-specific recommendation |
| `steps` | Category-specific implementation workflow |
| `codeExample` | Exact or safely inferred example when appropriate |
| `verification` | Rule-specific re-audit and direct inspection instructions |
| `estimatedEffort` | Rule difficulty mapped to a realistic range |

Priority is normalized as `high`, `medium`, or `low`. Difficulty maps to effort as follows:

| Difficulty | Estimated effort |
|---|---|
| `easy` | 5-30 minutes |
| `medium` | 1-4 hours |
| `hard` | 1-3 days |

These estimates describe a typical implementation. Site architecture and deployment processes can increase the actual effort.

## Missing Evidence Safety

If a failed or warning rule does not contain enough evidence, the generator does not invent a resource, URL, or targeted change. It returns:

```text
Unable to determine an exact fix from the available audit data.
```

The steps then instruct the user to collect the missing data and re-run the audit before applying a targeted change.

Legal Compliance solutions also contain:

```text
This is an automated check, not legal advice.
```

## Persistence and API Compatibility

The `solution` object is stored as a mixed field on `RuleResult`:

```text
server/src/models/RuleResult.js
```

It is also embedded in the existing category rule arrays stored on an audit. No existing rule or response field is removed or renamed.

The audit controller hydrates solutions when returning a report. This means older stored audits can receive solutions from their existing rule evidence even if they were created before the `solution` field was introduced.

Relevant files:

```text
server/src/services/rulesEngine.service.js
server/src/controllers/audit.controller.js
server/src/services/recommendationGenerator.service.js
```

## Score Improvement Plan

The improvement plan uses only actual `fail` and `warn` rules.

Sorting order:

1. High-priority failures
2. High-priority warnings
3. Remaining rules by impact, severity, and stable rule ID order

Items remain grouped by category. Each item includes its `ruleId`, allowing the frontend to navigate directly to the detailed rule card.

Potential improvement is shown only when eligible rule scores and category weights are available. The calculation assumes every listed failed or warning rule becomes a pass:

```js
categoryPotential = sum(100 - currentRuleScore) / eligibleRuleCount
overallPotential = categoryPotential * (categoryWeight / availableCategoryWeight)
```

The UI labels this as an upper bound, not a guaranteed score increase.

Implementation:

```text
server/src/services/scoreImprovement.service.js
client/src/components/audit/ScoreImprovementPlan.jsx
```

## Frontend Presentation

Failed and warning rule cards show a **View Solution** action. Passed, informational, skipped, and unavailable rules do not show this action.

The expanded solution contains:

1. Problem
2. Why it matters
3. Detected value
4. Expected value
5. Affected items
6. Step-by-step solution
7. Code example and copy action, when available
8. Verification
9. Priority and estimated effort

React renders crawled values and examples as text rather than injected HTML. This prevents crawled markup from executing in the report.

Implementation:

```text
client/src/components/audit/RuleCard.jsx
client/src/pages/AuditReport.jsx
```

## Adding or Changing a Rule

When adding or modifying a rule:

1. Keep the rule ID stable unless a deliberate API migration is planned.
2. Return an accurate status based only on available audit data.
3. Put the actual detected values and affected resources in `evidence`.
4. Write a precise result `message` and implementation `recommendation`.
5. Use `not_available` when required data cannot be collected.
6. Use `skipped` when the check does not apply.
7. Add an exact solution override when the rule needs a precise tag, header, configuration, or code example.
8. Run the complete recommendation coverage tests.
9. Confirm the registered rule count remains 251 unless adding or removing a rule is intentional.

Do not generate a failure from the recommendation layer. The rule evaluator is the source of truth for detected facts and status.

## Tests and Verification

Recommendation tests are located at:

```text
server/test/recommendationGenerator.test.js
```

They cover:

- Failed and warning output completeness
- No solutions for passed, skipped, unavailable, or informational results
- Missing-evidence fallback behavior
- Relative URL resolution
- Every registered rule and all 20 categories
- Legal Compliance disclaimers
- Improvement-plan ordering and weighted calculations

Run the tests:

```bash
cd server
npm test
```

Run the frontend production build:

```bash
cd client
node ./node_modules/vite/bin/vite.js build --configLoader runner
```

