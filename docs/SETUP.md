# Development and launch

## Local development

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Astro serves the UI at http://localhost:4321. This mode does not run the email endpoint.
Use `npm run dev:cloudflare` to build and serve both static pages and the Worker locally.
No emails are sent until Cloudflare email and Turnstile are configured. Local email bindings
may only simulate delivery; verify real delivery on a configured staging deployment.

## Structure

```text
src/
  data/site.ts              Business details and proposed services
  layouts/Layout.astro     Shared navigation, footer and SEO metadata
  pages/                   Static pages and service routes
  lib/enquiry.ts           Shared server-side form validation
  styles/global.css        Responsive visual design
worker/index.ts            POST /api/enquiry and static asset fallback
public/                    Static assets
tests/                     Enquiry validation tests
wrangler.jsonc             Cloudflare Worker and asset configuration
```

## Before launch

- Confirm business name, actual services, address, phone, opening hours and branding.
  Core business details now come from the supplied website screenshot; see `docs/CONTENT.md`
  for transcribed information, offers awaiting confirmation and missing contact details.
- Complete the privacy notice with the garage's details, processing basis, retention policy
  and rights information. Do this before enabling the form.
- Add real location/contact details to the site and then accurate AutoRepair structured data.
- Set `PUBLIC_SITE_URL` to the real HTTPS domain at build time. Without it, pages are noindex.
- Add a sitemap once the production domain and page list are confirmed; preserve or redirect
  useful old URLs when replacing the existing site.

## Cloudflare setup

This project deploys **one Worker with static assets**, rather than a separate Pages project
and API. Astro still builds static HTML; only `/api/*` invokes the Worker first.

1. Add the domain to Cloudflare DNS and configure Email Service/Email Routing. If the garage
   already uses an email provider, inspect existing MX records before changing email routing;
   use a dedicated sending subdomain where appropriate.
2. Verify the garage's destination inbox. Set `EMAIL_TO` to that address and `EMAIL_FROM` to
   an address on the configured sending domain. Sending to verified destinations supports
   the free notification-only setup. No automatic emails are sent to customers.
3. Restrict `send_email` in `wrangler.jsonc` with `destination_address` set to that inbox.
4. Create a Turnstile widget restricted to the site's hostname. Set `PUBLIC_TURNSTILE_SITE_KEY`
   before building; store `TURNSTILE_SECRET_KEY` as a Worker secret.
5. Set `SITE_ORIGIN` to the exact origin, such as `https://garage.example`, without a trailing
   slash. Store `EMAIL_FROM` and `EMAIL_TO` as Worker variables or secrets. Configure all
   environment values for staging separately. `.dev.vars.example` documents local variables.
6. Add Cloudflare rate limiting for POST `/api/enquiry` appropriate to the account's available
   plan, and test its threshold. The application already checks request size, origin,
   honeypot, fields and single-use Turnstile verification (hostname and action included).
7. Deploy only once the account/domain configuration is ready: `npm run deploy`.
8. Submit a real staging enquiry and verify inbox delivery, Reply-To, failure messages,
   expired spam challenges, keyboard access and mobile layout before opening to customers.

Email acceptance is not proof of inbox delivery. This starter does not persist enquiries or
provide a retry queue; consider durable storage if losing a notification would be unacceptable.
No submission content or customer contact details are logged by application code.

## Verification

```sh
npm run check
npm test
npm run build
npx wrangler deploy --dry-run
```

The dry run packages the Worker without publishing. Tests exercise validation, malformed
contact details, header injection, unsupported services, excessive content and invalid dates.
