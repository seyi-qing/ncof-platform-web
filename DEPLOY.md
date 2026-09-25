# GitHub → Vercel deployment

## 1. GitHub
Upload the contents of this folder to the web repository root. The repository should contain `package.json`, `next.config.ts`, `src/`, `public/`, etc. at the top level.

## 2. Vercel
Import the GitHub repository into Vercel.

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Root directory: `./`
- Node.js: 20.x or newer

Environment variable:

`NEXT_PUBLIC_API_URL=https://ncof-api.vercel.app/api/v1`

Set it for Production, Preview and Development as needed.

## 3. Backend CORS
After Vercel gives the frontend a URL such as `https://ncof-platform-web.vercel.app`, add that exact origin to the API's `CORS_ORIGINS` environment variable. Do not include `/api/v1` in the origin.

Example:

`CORS_ORIGINS=https://ncof-platform-web.vercel.app`

If multiple origins are required, use the comma-separated format supported by the API.

## 4. Verify
Open the deployed web URL and test:

1. login
2. dashboard
3. members (staff role)
4. finance
5. operations
6. meetings
7. governance
8. documents
9. notifications
10. elections
11. audit/control page (auditor/staff)

## 5. GitHub automatic deployment
After the initial Vercel import, every push to the connected production branch creates a new deployment. Pull requests can create preview deployments when enabled in Vercel.
