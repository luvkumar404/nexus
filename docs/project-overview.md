# Project Overview

Nexus SEO Auditor is a MERN stack SEO audit tool. A user enters a public website URL, the backend fetches and analyzes the page, runs the rule engine, calculates category and overall scores, stores the audit in MongoDB, and the frontend renders a detailed report.

## Main Capabilities

- URL validation and SSRF protection
- Public page fetch with timeout and safe protocols only
- HTML parsing with Cheerio
- Optional Lighthouse performance audit
- 251-rule audit engine across 20 categories
- Category-level and overall weighted scoring
- Rule-level evidence, recommendation, status, severity, confidence, and source
- Heading structure and social preview sections
- PDF report export
- Project dashboard and audit history

## Current Auth State

The app currently runs without login/register because auth was removed in a previous change request. Dashboard, projects, audits, and PDF export are available without account gates.

## Core Project Folders

```text
client/       React/Vite frontend
server/       Express/MongoDB backend
docs/         Project documentation
```
