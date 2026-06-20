# Architecture

Nexus SEO Auditor has two main applications.

## Frontend

The frontend lives in `client/` and uses:

- React with Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- Framer Motion

Important frontend areas:

```text
client/src/api/                 API clients
client/src/components/          Shared UI components
client/src/components/audit/    Audit report components
client/src/pages/               Route pages
client/src/hooks/               Polling and page hooks
client/src/utils/               Formatting and UI helpers
```

## Backend

The backend lives in `server/` and uses:

- Node.js
- Express
- MongoDB/Mongoose
- Cheerio
- Axios
- Playwright/Lighthouse
- robots-parser
- xml2js
- PDFKit

Important backend areas:

```text
server/src/config/              Environment and rule/category config
server/src/models/              MongoDB models
server/src/routes/              Express routes
server/src/controllers/         Route controllers
server/src/services/            Audit, parser, scoring, PDF, Lighthouse services
server/src/services/rules/      251 audit rules by category
server/src/middleware/          Validation and error handling
server/src/utils/               URL safety, rule result helpers, text/link/image helpers
```

## Data Flow

1. User submits a URL from the frontend.
2. Frontend calls `POST /api/audits/start`.
3. Backend validates and normalizes the URL.
4. Backend creates an `Audit` document with status `queued`.
5. Backend runs the audit asynchronously.
6. Frontend polls `GET /api/crawler/status/:auditId`.
7. When complete, frontend loads `GET /api/audits/:auditId`.
8. Report UI renders category cards, rule cards, heading structure, and social preview.
