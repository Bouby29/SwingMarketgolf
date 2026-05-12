# Security TODO — SwingMarketGolf

## Critical (planned for next dedicated session)
- [ ] Remove service_role key from client bundle (currently in
  AdminDashboard.jsx createClient call)
- [ ] Create api/admin/* serverless endpoints (~12 endpoints estimated)
- [ ] Implement signed JWT admin auth (HMAC or RS256)
- [ ] Replace 47 supabaseAdmin.from() calls with fetch('/api/admin/...')
- [ ] Migrate from sessionStorage flag to httpOnly cookie session

## Done
- [x] 2026-05-11 — Stripe secret key rolled and set as Sensitive on Vercel
- [x] 2026-05-11 — Admin passwords hashed with bcrypt (pgcrypto, cost 10)
- [x] 2026-05-11 — Removed hardcoded ADMIN_LOGIN/ADMIN_PASSWORD constants
- [x] 2026-05-11 — Removed dead code AdminDashboard_old/_backup.jsx

## Notes
- Critical refactor is tracked but DELIBERATELY POSTPONED to a dedicated
  session (4-6h). Site is in Coming Soon mode so risk is minimal but real.
