# Setup and Deployment

## Requirements

- Node.js
- npm
- MongoDB
- Internet access for auditing public websites
- Chromium browser dependency for Lighthouse

## Install Dependencies

From the project root:

```bash
npm run install:all
```

Or install separately:

```bash
cd server
npm install

cd ../client
npm install
```

## Environment Variables

Create:

```text
server/.env
```

Use `.env.example` as the template.

Important variables:

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

## Run Development Servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Lighthouse and Playwright

The backend uses Playwright Chromium for Lighthouse.

Install the browser:

```bash
cd server
npx playwright install chromium
```

The server package also includes:

```json
"postinstall": "npx playwright install chromium"
```

If Chromium is missing, Performance rules become `not_available` and do not reduce the overall score.

## Disable Lighthouse

To disable Lighthouse:

```env
LIGHTHOUSE_ENABLED=false
```

Performance rules will show:

```text
Performance audit is disabled in environment settings.
```

The Performance category score will be `NA`, and overall score will be calculated from available categories only.

## Debug Mode

Default:

```env
AUDIT_DEBUG=false
```

When `AUDIT_DEBUG=true`, backend rule results may include `developerDetails` for troubleshooting.

Developer details are collapsed by default in the UI.

## Render Deployment

Recommended backend build command:

```bash
npm install && npx playwright install chromium
```

Required environment variables:

```env
MONGO_URI=
CLIENT_URL=https://your-frontend-domain
LIGHTHOUSE_ENABLED=true
AUDIT_DEBUG=false
NODE_ENV=production
```

If the host cannot install Chromium:

```env
LIGHTHOUSE_ENABLED=false
```

## Vercel or Netlify Frontend

Set:

```env
VITE_API_URL=https://your-backend-domain/api
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```
