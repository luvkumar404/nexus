# Nexus SEO Auditor

Nexus SEO Auditor is a MERN stack SEO audit application with a React/Vite client and an Express/MongoDB API. It crawls public websites, analyzes SEO signals from real HTML, scores audits, stores project history, and exports PDF reports.

## Features

- Audit any public URL without registration
- Dashboard, projects, saved audit history, and PDF export without account gates
- SSRF-aware URL normalization and validation
- Homepage and internal crawl with configurable page limit and duplicate URL avoidance
- On-page checks for titles, descriptions, canonical tags, headings, word count, image alt text, social tags, and schema
- Technical checks for status codes, HTTPS, robots.txt, sitemap.xml, indexability signals, mixed content, hreflang, broken links, and language metadata
- Lighthouse-powered performance/Core Web Vitals audit with graceful fallback
- Mobile SEO checks through viewport detection and Lighthouse mobile output
- Content quality checks including thin content, readability, and duplicate similarity
- Link, image, resource, structured data, backlink placeholder, and Google Search Console placeholder sections
- PDF export for completed audits
- Responsive SaaS UI with light/dark mode, charts, tables, badges, progress state, empty states, and errors

## Tech Stack

Frontend: React, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Framer Motion, React Hook Form, React Hot Toast.

Backend: Node.js, Express, MongoDB, Mongoose, Cheerio, Axios, Playwright, Lighthouse, robots-parser, xml2js, PDFKit, Helmet, CORS, express-rate-limit, dotenv.

## Folder Structure

```text
server/src
  config/           db and environment loading
  models/           WebsiteProject, Audit, PageAudit, Issue, Recommendation
  routes/           project, audit, crawler routes
  controllers/      route handlers
  services/         crawler, analyzer, Lighthouse, link, sitemap, robots, PDF, scoring, placeholders
  middleware/       URL validation, async and error handling
  utils/            URL safety, requests, similarity, logger

client/src
  api/              Axios client and API wrappers
  components/       report cards, tables, nav, PDF button
  pages/            landing, dashboard, project details, audit report, history
  hooks/            audit progress polling
  utils/            formatting and score helpers
```

## Setup

Install dependencies:

```bash
npm run install:all
```

Create backend environment:

```bash
cp .env.example server/.env
```

Set at minimum:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nexus_seo_auditor
CLIENT_URL=http://localhost:5173
AUDIT_MAX_PAGES=25
AUDIT_CONCURRENCY=3
LIGHTHOUSE_ENABLED=true
AUDIT_DEBUG=false
NODE_ENV=development
```

Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## API Routes

Projects:

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`

Audits:

- `POST /api/audits/start`
- `GET /api/audits/:auditId`
- `GET /api/audits/project/:projectId`
- `DELETE /api/audits/:auditId`
- `GET /api/audits/:auditId/pdf`

Crawler:

- `POST /api/crawler/preview`
- `GET /api/crawler/status/:auditId`

## Scoring

The overall score is weighted to 100 points:

- Technical SEO: 30
- On-page SEO: 25
- Performance: 20
- Mobile SEO: 10
- Content quality: 10
- Structured data/social tags: 5

Issues subtract category points by severity. Lighthouse scores are folded into performance and SEO-related technical scoring when available. Each issue includes severity, category, affected URL, recommendation, estimated impact, and difficulty.

## Security Notes

- Localhost, private IPs, `.local` hosts, unsafe protocols, and internal-network resolutions are blocked before crawling.
- Requests use timeouts and redirect limits.
- Audit start and preview endpoints are rate-limited.
- Secrets are read from environment variables and not committed.
- Crawl size is limited by `AUDIT_MAX_PAGES`.

## Limitations

- Backlink metrics are not fabricated. The UI and service layer are ready for Ahrefs, Semrush, Moz, Majestic, or Google Search Console APIs.
- Google Search Console OAuth is a placeholder until credentials and consent flow are configured.
- Lighthouse requires Playwright browser support on the host. If it fails, the audit still completes with a reason.
- The crawler is intentionally conservative and does not attempt full enterprise-scale site crawling.

## Sample Test URLs

- `https://example.com`
- `https://www.wikipedia.org`
- `https://developer.mozilla.org`

Avoid auditing sites you do not have permission to test at high frequency.

## Deployment

Backend can deploy to Render or similar Node hosts. Set `MONGO_URI`, `CLIENT_URL`, and `LIGHTHOUSE_ENABLED` in the service environment.

For Render, use this backend build command so Lighthouse has a Chromium binary:

```bash
npm install && npx playwright install chromium
```

If browser installation is not available in your host, set `LIGHTHOUSE_ENABLED=false`. Performance rules will be reported as not available and will not reduce the overall score.

Frontend can deploy to Vercel or Netlify. Set:

```env
VITE_API_URL=https://your-api-host.example.com/api
```

## Future Improvements

- Queue-backed crawling with Redis/BullMQ
- Real provider integrations for backlinks and Search Console
- Multi-user team workspaces
- Scheduled audits and email alerts
- More robust JavaScript rendering for every crawled page
- Advanced duplicate-content clustering
