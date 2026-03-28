# AGENT.md

## Current Project State: **Production Ready (V1.1)**

### System Logic
- **Primary AI Engine:** Google Gemini 2.0 Flash (Live streaming).
- **Secondary AI Engine:** OpenAI GPT-4o Fallback (Implemented).
- **Security Protocols:** Validated MIME types (`ALLOWED_MIME_TYPES`), 10MB size cap server-side, 403/413/415 status code responses.
- **Triage Protocol:** Domain-specific P1/P2/P3 categorization prompt with immediate medical actions and dispatch instructions.

### Accessibility Matrix
- **[A] Forms:** Semantic `<form>` with `sr-only` labels.
- **[A] Interactivity:** `aria-label` on all icon-only buttons (`Mic`, `ImageIcon`, `FileText`).
- **[A] Live Regions:** `aria-live="polite"` for dynamic file attachment status.
- **[A] Testing:** Dedicated scenario-based testing section with ARIA descriptive text.

### Infrastructure
- **Build Mode:** Standalone production build enabled (`output: standalone`).
- **Deployment:** Multi-stage Dockerfile verified with `ARG` build-time injection for Maps API keys.

- **Build Fix:** Removed `package-lock.json` from `.dockerignore` to resolve `npm ci` build stage failures.

---
*Updated: 2026-03-28T14:55:00+05:30*
