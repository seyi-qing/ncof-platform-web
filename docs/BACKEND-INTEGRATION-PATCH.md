# Backend integration notes

## API base

Set `NEXT_PUBLIC_API_URL` to your FastAPI base including `/api/v1`, e.g.:

```
NEXT_PUBLIC_API_URL=https://ncof-api.vercel.app/api/v1
```

## Auth

- Login: `POST /auth/login` → `{ access_token, refresh_token }`
- Refresh: `POST /auth/refresh` with refresh token
- Bootstrap (one-time): `POST /admin/bootstrap`

## Key routes used by this UI

| Page | Endpoint |
|------|----------|
| Dashboard | `/members`, `/finance/summary` (if present) |
| Members | `GET/POST /members` |
| Finance | `/finance/*` |
| Elections | `/governance/elections`, `/governance/elections/{id}` |
| Operations | `/operations/incidents`, `/operations/assets` |
| Meetings | `/meetings` |
| Governance | `/governance/motions` |
| Notifications | `/member-experience/notifications` |
| Documents | `/member-experience/documents` |
| Audit | `/controls/audit-log` |

## CORS

On the API project set:

```
CORS_ORIGINS=https://your-web.vercel.app
```
