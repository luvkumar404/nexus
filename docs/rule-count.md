# Rule Count

## What “Rule Count Remains 251” Means

“Rule count remains 251” means the audit engine still loads exactly **251 SEO audit rules**.

Each rule is one individual check, such as:

- `core-title-present`
- `core-description-length`
- `perf-lcp`
- `social-og-title`
- `crawl-sitemap-in-robotstxt`
- `legal-cookie-consent-detection`

The rules are grouped into the 20 audit categories, including Core SEO, Performance, Links, Images, Crawlability, Social, Internationalization, and Legal Compliance.

## Why It Matters

The project uses `SEO-AUDIT-RULES.md` as the rule source of truth. The expected audit engine contains 251 rules.

When code changes are made, the rule count should stay at 251 unless the rule source itself changes.

This protects against accidentally:

- Deleting a rule
- Duplicating a rule
- Forgetting to register a rule file
- Renaming a rule in a way that removes it from the engine
- Breaking category imports

## What It Does Not Mean

It does **not** mean all 251 rules affect the score.

Only rules with these statuses affect scoring:

- `pass`
- `warn`
- `fail`

Rules with these statuses do not affect scoring:

- `info`
- `not_available`
- `skipped`

So an audit can load 251 rules while only a smaller number are score-eligible for a specific page.

Example:

```text
Total rules: 251
Score-eligible rules: 83
Not available rules: 40
Skipped rules: 90
Info rules: 38
```

The score is calculated only from the 83 score-eligible rules.

## Where Rules Are Defined

Rules are organized by category in:

```text
server/src/services/rules/
```

The main rule registry is:

```text
server/src/config/auditRules.config.js
```

That file imports all category rule files and combines them into:

```js
AUDIT_RULES
```

## How To Check The Rule Count

From the project root, run:

```bash
node --input-type=module -e "import { AUDIT_RULES } from './server/src/config/auditRules.config.js'; console.log(AUDIT_RULES.length)"
```

Expected output:

```text
251
```

## Rule Count vs Applicable Rules

There are three useful counts in the report:

| Term | Meaning |
|---|---|
| Total rules | All loaded rules in the audit engine |
| Applicable rules | Rules that returned pass, warn, or fail |
| Score-eligible rules | Same as applicable rules; these affect scoring |

For a single-page audit, many rules may be skipped or unavailable because they require:

- Full crawl mode
- Lighthouse/browser data
- Rendered DOM comparison
- Sitemap data
- robots.txt data
- Multilingual site signals
- Product/article/local-business page type
- External validation

Those rules are still counted in the total 251, but they do not reduce the score.
