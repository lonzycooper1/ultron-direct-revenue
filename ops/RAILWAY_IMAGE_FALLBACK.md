# Official-image startup fallback

Railway supports public image sources without a Railway build step. During a
build-service outage, the existing trading service can use `node:22-alpine`
with `ops/railway-image-bootstrap.mjs` supplied verbatim as its Node `-e`
startup module. This is only useful if Railway accepts image deployments;
never circumvent a platform deployment pause or use an untrusted image.

Required deployment variables:

- `ULTRON_BOOTSTRAP_COMMIT`: the full current, CI-tested Git commit.
- `ULTRON_BOOTSTRAP_MANIFEST`: exact JSON output from
  `node ops/runtime-checksums.mjs` on that commit.
- Existing App credentials stay in the service environment; never embed them
  in a command, image, manifest, repository, artifact or log.

The module downloads the public archive for that exact commit, checks all
trading runtime files and the dependency lockfile, installs locked dependencies
with lifecycle scripts disabled, and starts the trading runtime. Archive and
dependency tools receive only PATH, a temporary HOME and NODE_ENV. The trading
process receives the existing service environment. No build is performed on
Railway. `/health` exposes the validated source commit; startup logs record
the same commit and runtime checksum.

GitHub CI tests the full application and PostgreSQL suites before actually
starting this bootstrap inside the official Node image. The smoke container
receives no production credentials or database URL and must report the exact
source commit, App provider, absent credentials, and live/autonomous trading
disabled.

Configure only the existing trading service, preserving its database, domain,
approval key, provider and risk limits. Stage source and startup changes
together after verifying no unrelated environment changes are pending. Verify
deployment SUCCESS, the image used, the health source commit and provider,
and sanitized App read-authentication logs before reporting success.

This fallback requires GitHub and npm connectivity on every cold start. It is
an outage-recovery path, not a claim that Railway itself has been repaired.
When builds recover, restore the GitHub source and `node crypto-bot-runtime.mjs`
startup command using the latest tested commit, then verify that deployment.
Keep live trading disabled: successful image startup and account reads do not
certify App accounting, fee interpretation, uncertain-order recovery or dispatch.
