# Audit Flow

This document explains what happens when an audit runs.

## 1. URL Validation

The request goes through `validateUrl.middleware.js`.

The backend:

- Adds `https://` when missing
- Blocks unsafe protocols such as `file://`
- Blocks localhost URLs
- Blocks private/internal IP ranges
- Resolves domains and rejects private-network targets

This prevents SSRF attacks.

## 2. Audit Creation

`audit.controller.js` creates an `Audit` document:

```js
{
  url,
  status: "queued",
  currentStep: "Queued"
}
```

Then `crawler.service.js` starts the audit in the background.

## 3. Page Fetch

`fetchPage.service.js` fetches the URL using `safeRequest.js`.

It records:

- Original URL
- Final URL
- HTTP status code
- Response headers
- HTML
- Response time

## 4. Robots and Sitemap

The backend attempts to fetch:

- `robots.txt`
- `sitemap.xml`

These are used by rules in Technical SEO and Crawlability.

If the files are missing or cannot be parsed, the rules report that clearly.

## 5. Lighthouse

`lighthouse.service.js` runs Lighthouse through Playwright when `LIGHTHOUSE_ENABLED=true`.

If Playwright browser binaries are missing, the backend returns clean unavailable data:

```json
{
  "available": false,
  "code": "PLAYWRIGHT_BROWSER_MISSING",
  "message": "Performance audit is unavailable because the browser dependency is missing."
}
```

Performance rules then become `not_available` and do not reduce the score.

## 6. HTML Parsing

`htmlParser.service.js` uses Cheerio to extract:

- Title
- Meta description
- Canonical URL
- Viewport
- Robots meta
- Headings H1-H6
- Links
- Images
- Scripts and stylesheets
- Structured data
- hreflang tags
- Social tags
- Word count
- Readability
- Page metrics

## 7. Rule Engine

`rulesEngine.service.js` runs all 251 rules.

Each rule receives a shared context object:

```js
{
  url,
  finalUrl,
  html,
  $,
  headers,
  statusCode,
  robotsTxt,
  sitemap,
  lighthouse,
  renderedDom,
  links,
  images,
  headings,
  meta,
  schema,
  crawlPages
}
```

## 8. Scoring

`scoring.service.js` and `categoryScoring.service.js` calculate:

- Rule status counts
- Category scores
- Weighted overall score
- Grade

Only `pass`, `warn`, and `fail` are score-eligible.

## 9. Persistence

The backend stores:

- `Audit`
- `PageAudit`
- `RuleResult`
- `CategoryResult`
- `Issue`
- `Recommendation`

## 10. Report Rendering

The frontend renders:

- Report header
- Summary cards
- Audit category grid
- Heading structure
- Social media preview
- Detailed category sections
- Rule cards
- PDF export button
