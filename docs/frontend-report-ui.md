# Frontend Report UI

The audit report page is implemented in:

```text
client/src/pages/AuditReport.jsx
client/src/components/audit/
```

## Main Sections

### Report Header

Component:

```text
ReportHeader.jsx
```

Shows:

- Website URL
- Final URL
- Audit date
- Overall score
- Grade
- Total/scored rules
- Passed, warnings, failed, not available, skipped
- Export PDF button
- Re-run audit button

### Audit Summary Cards

Component:

```text
AuditSummaryCards.jsx
```

Shows high-level counts from the backend summary.

### Audit Categories Grid

Components:

```text
AuditCategoryGrid.jsx
AuditCategoryCard.jsx
CircularScore.jsx
```

Shows all 20 categories.

Each card shows:

- Circular score
- Category name
- Category status
- Failed count
- Warning count
- Passed/applicable checked count
- Not available count
- Skipped count

Clicking a card scrolls to the detailed category section.

### Heading Structure

Component:

```text
HeadingStructure.jsx
```

Shows H1-H6 groups and heading warnings.

Warnings include:

- No H1
- More than one H1
- Skipped heading levels
- Duplicate headings

### Social Media Preview

Components:

```text
SocialMediaPreview.jsx
MetaTagsTable.jsx
SocialPreviewCard.jsx
```

Shows Open Graph and Twitter meta tags plus a preview card.

Fallback behavior:

- `og:title` missing: use title tag
- `og:description` missing: use meta description
- image missing: show placeholder
- missing values: show `Not found`

### Detailed Category Sections

Components:

```text
AuditSection.jsx
RuleCard.jsx
StatusBadge.jsx
SeverityBadge.jsx
```

Each category section shows:

- Circular score
- Category name
- Rule count
- Category status
- Passed, warning, failed, not available, skipped badges
- Every rule card in that category

## Rule Cards

Each rule card shows:

- Rule name
- Rule ID
- Status badge
- Severity badge, only when useful
- Message
- Recommendation
- Evidence/value
- Affected URL
- Impact
- Difficulty
- Source
- Confidence
- Developer details, collapsed by default

For `not_available`:

- Card border is gray
- Badge says `Not available`
- Severity badge is hidden
- Raw backend errors are not shown unless debug details exist

## Score Colors

| Score | Color |
|---:|---|
| 90-100 | Green |
| 70-89 | Orange |
| 50-69 | Orange/red warning |
| 0-49 | Red |
| null | Gray |
