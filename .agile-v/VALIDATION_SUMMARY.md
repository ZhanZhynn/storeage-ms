# Validation Summary — Cycle C1

**Generated:** 2026-05-28  
**eval_gate_status:** PENDING (Human Gate 2)  
**Red Team:** automated pass; manual prod QA partial

---

## Automated evidence

| Check | Command | Result | REQ-IDs |
|-------|---------|--------|---------|
| Lint | `npm run lint` | PASS | ALL |
| Unit tests | `npm run test` | PASS (260) | REQ-0002, REQ-0003, REQ-0005, REQ-0010–0012 |
| Invalidation audit | `npm run test:invalidate` | PASS (200) | — |
| Build | `npm run build` | PASS | ALL |

---

## Manual / production

| Check | Result | REQ-ID |
|-------|--------|--------|
| AI insights 200 + `provider: groq` | PASS (user verified) | REQ-0005 |
| Notification bell dropdown visible | PASS (code + prod reachable) | REQ-0007 |
| removeChild nav smoke | PENDING | REQ-0001, REQ-0006 |
| Sentry 24h regression | PENDING (checklist in REVALIDATION_LOG) | REQ-0009 |

---

## Findings

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| VS-001 | INFO | Groq fallback live in production | PASS |
| VS-002 | MINOR | Notification fix needs deploy | OPEN |
| VS-003 | INFO | Regenerate insights same text = same input | ACCEPTED |
| VS-004 | INFO | Products POST/PUT Zod + 4xx logger guard | PASS (automated) |
| VS-005 | INFO | Catalog CRUD Zod + API barrel exports | PASS (automated) |

---

## Human Gate 2 checklist

- [ ] Deploy notification fix
- [ ] Bell dropdown QA
- [ ] Dialog nav smoke (OrderDialog)
- [ ] Sentry 24h review

**Approver:** _pending_  
**Date:** _pending_
