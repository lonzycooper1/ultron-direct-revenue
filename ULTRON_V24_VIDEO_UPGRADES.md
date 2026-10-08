# ULTRON v24 video upgrade: real capabilities vs activation

Code is integrated in the existing Direct Revenue app. Check public /upgrade-lab or /api/upgrades/v24 and owner-authorized endpoints as below.

## 1. Web intelligence and optional browser adapter
POST /api/upgrades/v24/scan {"website":"https://example.com"} uses the existing robots-aware HTML scanner. Dynamic pages need a real Browser Use-compatible provider. To enable POST /api/upgrades/v24/browser, configure Railway service env:
ULTRON_BROWSER_API_URL (the HTTPS POST JSON endpoint), ULTRON_BROWSER_API_TOKEN and ULTRON_BROWSER_ALLOWLIST (comma-separated **exact approved hostnames**).
Only read-only extract is requested; no clicks, login, form submissions, payments or posting. Connecting a provider is separate from this code.

## 2. Portable Coolify topology
compose.coolify.yaml is a deployment *starting point*, not a production-ready secrets or HA configuration. Before deploying, replace placeholder HTTPS domain, example password, add secret management, restricted ingress, TLS, reliable off-site database backups, restore drill, disaster recovery, and authenticated health checks. Never put real credentials in Git. Running two ULTRON replicas with production PayPal callbacks and independent databases can duplicate business effects, so migrate or route traffic deliberately; Railway remains the live source of truth until tested cutover.

Coolify reference: https://coolify.io/docs/services/

## 3. CEO and specialized roles
Seven policy-bounded roles are defined. POST /api/upgrades/v24/pulse calls the existing supervisor's safe cycle and durably records work priority. These are not seven separately running LLMs. Paid fulfillment wins over inquiry response, which wins over new acquisition.

## 4. Conversion psychology without deception
POST /api/upgrades/v24/copy
{"company":"Example HVAC","website":"https://example.com","observations":["No clear booking CTA on public home page"],"offer":"audit"}
Creates an unsent draft only. Offer values: audit $500, automation $2500, operations $7500, businessos $10000. No invented loss, customers, testimonials, or guaranteed return.

## 5. Grant and business-funding eligibility
POST /api/upgrades/v24/grant {"age":21,"region":"US","forProfit":true,"completedCourses":2} returns a preliminary checklist, never a grant award or application. The $10,000 Verizon Digital Ready 2026 source is https://pilot-digitalready.verizonwireless.com/funding . Verify current rules from the source before the owner files; program selection is competitive. Existing lender-readiness infrastructure remains intact.

## 6. Market and crypto source-quality guard
To activate POST /api/upgrades/v24/market, set ULTRON_MARKET_DATA_URL and optional ULTRON_MARKET_DATA_TOKEN in Railway, pointing to an **authorized** HTTPS feed returning:
{"quotes":[{"symbol":"AAPL","price":100.5,"provider":"Licensed feed name","asOf":"2026-10-08T15:50:00Z"}]}
Quotes older than 15 minutes are marked STALE. Any response is labeled sourced, not independently exchange verified. No real orders or leverage permitted.

## Authentication and operations
POST endpoints require Bearer ULTRON_ACQUISITION_ADMIN_TOKEN, the existing production administrator token. Do not publish that token, and never send tokens in GET query parameters. Read-only public status intentionally exposes only connection states, not secrets.

No approval to send outreach, buy domains, apply for funding, send money, or place trades is implied by the software's existence.
