# Backend API

The backend runs on Express and exposes REST endpoints under `/api`.

## Health

### `GET /api/health`

Returns API status.

```json
{
  "status": "ok",
  "name": "Nexus SEO Auditor"
}
```

## Audits

### `POST /api/audits/start`

Starts a new audit.

Request:

```json
{
  "url": "https://example.com",
  "projectId": "optional-project-id"
}
```

Response:

```json
{
  "auditId": "...",
  "status": "queued"
}
```

### `GET /api/crawler/status/:auditId`

Returns audit progress.

```json
{
  "status": "running",
  "progress": 78,
  "currentStep": "Running 251-rule audit engine"
}
```

### `GET /api/audits/:auditId`

Returns the completed audit report JSON.

Main fields:

- `url`
- `finalUrl`
- `statusCode`
- `overallScore`
- `grade`
- `summary`
- `categories`
- `headingStructure`
- `socialPreview`
- `pageMetrics`
- `audit`
- `pages`
- `issues`
- `ruleResults`
- `categoryResults`

### `GET /api/audits/project/:projectId`

Returns audits for a project.

### `GET /api/audits/:auditId/pdf`

Downloads the audit PDF report.

### `DELETE /api/audits/:auditId`

Deletes an audit and related results.

## Projects

### `POST /api/projects`

Creates a website project.

```json
{
  "name": "Example",
  "url": "https://example.com"
}
```

### `GET /api/projects`

Lists all projects.

### `GET /api/projects/:id`

Returns one project and its latest audits.

### `DELETE /api/projects/:id`

Deletes a project and its audits.

## Security Middleware

The URL validator blocks:

- Localhost
- Private IP ranges
- Internal network URLs
- Unsafe protocols
- `file://` URLs

Audit endpoints are rate-limited.
