# ULTRON Cinematic Studio v43

## The user's actual quality target

Reference: ScreenRecording_10-14-2026 19-28-15_1.mp4, 64.067 seconds.

The reference shows three different visual patterns: photoreal animal/human comedy with fur, skin, stage lighting and physical action (approximately 0–19s); a retail reaction performance with real-world detail (approximately 20–35s); and an expressive stylized 3D family scene with consistent characters, warm practical lighting and changing camera angles (approximately 36–51s). The remaining recording shows the ChatGPT interface. Visual appearance does not establish which models were used or whether the retail clip is AI-generated.

The earlier ULTRON_First_AI_Shorts_Video.mp4 is a 45-second animated typography explainer with abstract graphics. It does not demonstrate this requested character-and-action quality. It is not suitable proof of cinematic generation capability and must not be presented as such.

## Implemented production workflow

- Original screenplay/shot planning for a three-shot, 15-second narrative.
- Shared character, location and style descriptions; an approved anchor image for every shot.
- Runway API adapter with actual task creation and polling, credentials from RUNWAYML_API_SECRET, current model permission and credit checks, and per-project reserved credit ceilings.
- No blind retries after uncertain billable submission. Failed/timed-out submissions are locked for reconciliation.
- Background polling and advancement of explicitly authorized jobs within their individual budgets. Unauthorized draft plans do not generate charges.
- FFmpeg editor for completed provider shots: normalizes framing and frame rate, assembles picture, mixes documented licensed audio and exports H.264/AAC with fast-start playback.
- Actual binary MP4 inspection: codec, pixel format, portrait dimensions, duration, frame rate, audio presence/level, size, black-frame and freeze checks.
- Seven separate visual/story/rights scores after full playback. The review binds to the final file's SHA-256; replacing a file invalidates its release.
- Private owner preview; deliberate release of an approved public sample; private customer download and explicit acceptance.
- Sales inquiry capture, draft scoped quotes, readiness-gated quote issue and PayPal checkout, verified-payment production enqueueing and idempotent fulfillment lookup.
- Customer payments are not evidence of completed production. No finished result, virality, monetization or revenue is guaranteed.

## Current verified blockers

The connected Runway workspace was authenticated and checked. It is on the Free plan and returns zero available video models. There is no alternative connected workspace.

Railway's current production variable inventory contains no RUNWAYML_API_SECRET. A ChatGPT Runway connection does not automatically authorize ULTRON's unattended server. Runway Dev API access requires its own credential and funded API credits; web-app and API billing are distinct.

Therefore no cinematic sample matching the reference was generated, reviewed or sold in this task. Paid cinematic checkout remains locked. These blockers are not fixed by adding prompts or claiming tests prove aesthetic quality.

## Required evidence to finish end to end

1. Funded video-generation access and the runtime API credential installed privately on Railway.
2. Approved original character anchors, a concrete storyboard and documented media/voice/music rights.
3. One actual three-shot generation, downloaded and edited with licensed sound.
4. Full playback review against character consistency, anatomy/physics, timing, lighting/detail, narrative/editing, sound and rights criteria; no score below 4/5.
5. A released sample bound to the actual final MP4 and a live provider preflight.
6. A genuine customer inquiry, issued scoped quote, accepted terms and external PayPal capture.
7. Promised final deliverable, customer acceptance, recorded provider costs/fees/refunds and payout settlement.

## Operations

Open /video-studio. Public routes expose availability and receive voluntary requests; owner generation, editing, quote and review actions require the existing acquisition-admin credential. Large media uploads are owner-only and bounded. Rendered MP4s are stored in existing Postgres, capped at 30 MB each; this is a bounded initial implementation, not a high-volume media storage architecture. Object storage/CDN migration is needed for scale.

Model costs change. The default adapter reserves at least 12 credits/second for its configured gen4.5 model, based on the retrieved official pricing table. Confirm the current rate before authorization; an unexpectedly larger provider estimate stops further submissions. Model output URLs can expire: edit/download completed shots promptly.

The studio does not produce all creative possibilities in the reference automatically: facial/dialogue performance, exact character continuity and fine physical action still depend on generation output, iteration, licensed audio/voice work and perceptual review. It must not claim it can exceed the reference until a finished sample establishes that.

## Validation and limits

Focused local regression tests validate shot structure, budget reservation and replay prevention, authorization/anchor/prompt/provider requirements, failed preflight, exact-file-bound review, real FFmpeg checks and owner-only actions, plus prior v41/v42 regression checks. Generated browser script syntax is checked separately. Synthetic technical fixtures are not cinematic samples or commercial portfolio evidence.

Live provider generation, checkout and a real client delivery remain unverified because funded runtime video access and a reviewed sample are missing. No self-payment or fabricated customer was used.

Primary implementation references:
- https://docs.dev.runwayml.com/guides/using-the-api/
- https://docs.dev.runwayml.com/guides/pricing/
- https://docs.dev.runwayml.com/guides/setup/
- https://github.com/runwayml/sdk-node

## Deployment verification

PR #32 merged as ed53126e553fc2871d9ea67fd1844a8812033abf. Railway deployment dffc8eb6-2e92-4b88-a600-8c52d0ef4e31 succeeded. All 296 tests passed both GitHub CI and Railway's configured pre-deployment checks. All five Railway services are online with no reported issues. The runtime remains pinned to this tested code commit.

Studio: https://ultron-direct-revenue-production.up.railway.app/video-studio

These tests establish the implemented workflow and technical checks, not equivalence to the reference. The generation-access and reviewed-sample blockers above remain outstanding.
