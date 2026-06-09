# Revalidation Log

| Date | Trigger | REQ-IDs | Result | Notes |
|------|---------|---------|--------|-------|
| 2026-05-19 | Catalog Zod + barrel export deploy | REQ-0012 | PASS (automated) | lint/test(260)/invalidate/build green |
| 2026-05-19 | Notification bell code + prod reachability | REQ-0007 | PASS (code) | `NotificationBell` uses `DropdownMenu` portal; prod `/login` 200 after `f250980` |
| 2026-05-19 | Sentry 24h post-deploy watch opened | REQ-0009 | PENDING | Human Gate 2 — review window starts after this deploy |

## REQ-0009 checklist (24h after deploy)

- [ ] Deploy SHA: _record on deploy_
- [ ] Sentry project **stock-inventory** — cases 1–7 event count vs baseline (`docs/SENTRY_ERRORS.md`)
- [ ] Case 1 `Product operation error:` — no new 4xx events (logger guard)
- [ ] Case 3 duplicate invoice — 409 only, no Sentry
- [ ] Case 4 OAuth `access_denied` — silent
- [ ] Case 6–7 `removeChild` — translate scrub only; real portal bugs escalate to CAPA
- [ ] CAPA entry in `CAPA_LOG.md` if regression
