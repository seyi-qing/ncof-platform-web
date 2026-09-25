# NCOF Platform Web 2.0 — Production status

This frontend is aligned to the NCOF Platform API (1.7.x). It uses real API routes rather than invented endpoints.

## Integrated areas
- JWT login + refresh
- role-aware navigation
- admin dashboard and member dashboard
- member registry
- finance / dues / transactions
- savings / loans / welfare operations
- meetings / attendance
- governance / committees / announcements
- election creation, positions, candidates, open/close, ballot, vote and results
- documents
- notifications and preferences
- audit/control health

## Election compatibility
The backend does not expose `GET /api/v1/governance/elections`. The UI loads elections by ID via `GET /api/v1/governance/elections/{election_id}`.

## Required backend CORS
Set the deployed frontend origin on the API `CORS_ORIGINS` variable (no path, no trailing slash).
