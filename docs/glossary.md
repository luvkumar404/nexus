# Glossary

## Audit

A saved SEO analysis run for one URL. Stored in the `Audit` collection.

## Rule

A single SEO check, such as `core-title-present` or `perf-lcp`.

## Rule Result

The output of one rule for one audit. Stored in `RuleResult`.

## Category

A group of related rules. Example: Core SEO, Performance, Images, Security.

## Category Result

The aggregated score and counts for one category. Stored in `CategoryResult`.

## Status

The outcome of a rule.

- `pass`: rule passed
- `warn`: improvement recommended
- `fail`: confirmed problem
- `info`: informational only
- `not_available`: data source missing or unavailable
- `skipped`: intentionally skipped for this audit mode

## Severity

How important a confirmed issue is.

- `critical`
- `high`
- `medium`
- `low`
- `info`

Severity is not the same as status.

## Score Eligible

A rule is score eligible only when its status is:

- `pass`
- `warn`
- `fail`

Rules with `info`, `not_available`, or `skipped` do not affect category or overall score.

## Confidence

How reliable the rule result is.

- `high`: direct evidence, such as HTML tag exists
- `medium`: indirect evidence or limited context
- `low`: request timeout, partial data, or uncertain external check

## Evidence

The value or data that explains a rule result.

Example:

```json
{
  "selector": "title",
  "value": "Example Page Title"
}
```

## Source

Where the rule got its evidence.

Common sources:

- `html`
- `headers`
- `lighthouse`
- `crawler`
- `sitemap`
- `robots`
- `rendered-dom`

## Not Available

The rule could not run because the required data source is missing.

Examples:

- Lighthouse disabled
- Playwright Chromium missing
- Crawl mode required
- Rendered DOM not available
- SSL expiry inspection not implemented

Not available is not a warning or failure.

## Skipped

The rule was intentionally skipped for the current audit mode.

## Lighthouse

Google’s audit engine for performance, accessibility, best practices, and SEO signals.

## Playwright

Browser automation library used to launch Chromium for Lighthouse.

## SSRF

Server-Side Request Forgery. A security issue where a server is tricked into requesting internal/private network resources.

The app blocks localhost, private IPs, unsafe protocols, and `file://` URLs.

## Robots.txt

A file at `/robots.txt` that gives crawler access instructions.

## Sitemap

An XML file, usually `/sitemap.xml`, that lists URLs a website wants crawlers to discover.

## Canonical URL

The preferred URL for a page. It helps avoid duplicate URL indexing.

## Hreflang

Tags used to indicate language or regional alternates of a page.

## Structured Data

Schema.org markup, usually JSON-LD, that helps search engines understand page entities.

## E-E-A-T

Experience, Expertise, Authoritativeness, and Trustworthiness. A group of trust and quality signals.

## AI/GEO Readiness

Checks that help content be understandable and accessible to AI search and generative answer systems. GEO means Generative Engine Optimization.
