# Changelog — NCOF Platform Web

## [2.1.0] — 2026-09-26

### Added
- Public homepage (features, audience, Login + Request demo)
- Self-serve profile edit on Settings (`PATCH /members/me`)
- Meeting minutes: draft, view, approve, Export PDF
- Finance: Export PDF dues statement; ₦ formatting; View dues detail
- Print-to-PDF helper (`src/lib/printPdf.ts`) — no extra npm packages
- Login links back to homepage

### Fixed
- Member names on Finance and meeting attendance (not UUIDs)
- Dashboard label: **Member ID:** + member number
- Notifications mobile layout (card stack)
- Sidebar footer spacing; nav visibility for all roles

### Requires API
- **ncof-platform API v1.8.x**

## [2.0.0] — prior baseline

- Next.js 15 App Router, role-based shell, core modules

---

## How to release next

1. Bump `VERSION` and `package.json` `version`
2. Update this CHANGELOG
3. Commit to `main`
4. GitHub → Releases → tag `v2.x.y`
