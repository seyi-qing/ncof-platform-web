# Versioning — NCOF Platform Web

## Scheme

**Semantic Versioning** (`MAJOR.MINOR.PATCH`)

| Change | Bump |
|--------|------|
| Breaking UX / routing | MAJOR |
| New screens or features | MINOR |
| UI bug fixes only | PATCH |

## Where the version lives

| File | Purpose |
|------|---------|
| `VERSION` | Canonical version |
| `package.json` → `version` | npm / project version |
| `CHANGELOG.md` | History |
| Git tag `v2.1.0` | Release marker |

## Tagging (GitHub UI)

1. https://github.com/seyi-qing/ncof-platform-web/releases/new  
2. Tag: `v2.1.0` on `main`  
3. Title: `NCOF Web v2.1.0`  
4. Body from `CHANGELOG.md`  
5. Publish  

## Compatibility

| Web | API |
|-----|-----|
| 2.1.x | 1.8.x |
| 2.0.x | 1.7.x |
