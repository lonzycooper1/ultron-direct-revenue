# Private file-service production — implementation handoff

This follow-up continues PR56 (main 9d9c417, Railway deployment db231477-7f58-43d5-97fe-c89c8f444f66). The previous release passed 411 application tests plus 43 crypto safety tests, zero failures/skips. Its public catalog, studio and access-denial routes were checked in the deployed browser/API; PostgreSQL health and PayPal readiness were healthy. Positive owner/provider/customer flows remain unverified.

## File processors

`/file-studio` and `/api/file-services` require the existing owner token for private data/actions. The public page contains no private records. Source authorization, customer scope and stable request identity are mandatory. Rights confirmation is an owner record, not independently verified licensing. Requests have scoped identity fingerprints, parent references for revisions, durable queue IDs, status, at most three explicit local attempts, cancellation before processing and exact-bundle owner review.

The worker uses the existing PostgreSQL enterprise queue (`FILE_SERVICE`). Only one active local render may run across replicas. Private source/output blobs use separate PostgreSQL keys so polling/listing does not repeatedly read large files. The index reserves a maximum 64 MiB across ten records, and actual encoded packages must fit their reservations. There is no automatic deletion, publishing, payment, outreach, provider media purchase or customer acceptance. Local work cannot automatically retry an expired lease. The owner must review and explicitly retry bounded deterministic processing.

| Processor | Actual output | Supported first-release scope |
|---|---|---|
| Presentation | Original PPTX, editable reflowed PPTX, native rendered PDF, per-slide PNGs and change log | 1–10 text-only source slides, source up to 2 MiB. Source order/wording retained unless an owner-supplied, fact-confirmed correction is provided. Text fit is checked with font metrics. Media, charts and embedded objects are refused rather than silently discarded. A supplied rich deck requires additional implementation/scope |
| Spreadsheet | Original XLSX, cleaned XLSX, native PDF/PNGs, transformation log, cell-count summary and calculation register | Up to 2 MiB, five sheets, 2,000 rows/40 columns per sheet. Explicitly selected string whitespace cleanup. Formula repairs require reason and independent expected result. Arithmetic and SUM/AVERAGE/MIN/MAX/COUNT ranges are evaluated, then compared with native recalculation. Shared/array, external and unsupported formulas block processing. Header formatting is opt-in. Summaries count cells/used ranges, not invented business records |
| Footage editing | Original MP4, 1–3 final MP4s, sidecar SRT captions, frame previews and manifest | Source up to 8 MiB/ten minutes; clips up to thirty seconds. Supplied caption text/timing and rights references. Portrait, landscape and square ratios. Original audio retained if present, no generated voice. FFprobe checks actual codec/dimensions/duration/audio; human review must assess meaning, pacing, caption accuracy and rights |

All bundles preserve originals and list file hashes. Large or unsupported inputs fail closed. A queued job, CLI availability or a fixture render does not establish successful production/customer delivery. These tools create private drafts; they do not activate commercial offers. Existing payment-bound print/audit journeys are retained; payment binding and acceptance for additional service offers still need implementation and production acceptance before selling those offers.

## Safety and dependencies

- OOXML files have bounded central-directory entries and expanded sizes, CRC checks and no external relationships, macros, active objects, charts or media. The native renderer uses a private profile with macro security set high.
- No shell interpolation receives customer input. Fixed local filenames, bounded arguments, local-only FFmpeg protocols and timeouts are used.
- LibreOffice, Poppler, FFmpeg and DejaVu fonts are installed in the existing revenue image, not a new service. Docker installs the committed lockfile with lifecycle scripts disabled.
- ExcelJS4.4.0, PptxGenJS4.0.1 and JSZip3.10.1 identities/licenses were checked against npm/upstream. Vulnerable transitive UUID/image-size versions were overridden with fixed compatible versions; actual native tests cover used behavior. Existing Nodemailer was updated to10.1.7 after checking upstream/Node requirements. `npm audit --omit=dev` reports zero known advisories for this lockfile at inspection time, not proof of comprehensive security. Deployed email authorization is still required.
- No crypto source/configuration, trading approval or financial limit is changed.

## Text and audit follow-up

New text submissions require the source roles promised by the service scope: resume/job description, original copy/business facts, client intake/style sample, transcript, etc. Listing platform/tone/length/keywords and social audience/channels are structured settings. Existing durable jobs remain available for collection/review. New revisions use a new request reference and an explicit same-customer parent job; previous outputs remain intact.

The audit return now puts new purchase codes directly in the URL fragment rather than routing through a token query. Legacy purchase access remains supported. The PDF ZIP contains its font license. Checkout still requires a reviewed sample release; each paid package also requires owner review and fresh PayPal verification.

## Verification to record after CI/deploy

Native tests produce and parse real PPTX/XLSX/MP4/PDF/PNG fixtures, preserve original bytes, verify native calculations and all three video aspect ratios, and reject unsafe file content. Durable lifecycle tests cover scope isolation, changed replays, cancellation, concurrent processing, bounded retry, blob integrity and PostgreSQL restart/JSONB key ordering. Fixture data is explicitly synthetic and never inserted as a production customer/order.

Remaining external actions: owner authentication for private production checks and reviewed-sample release; supplied authorized customer inputs; server OAuth/permissions for email/calendar/social/approved CRM writes; normal available AI allowance; a genuine buyer for customer/payment/acceptance evidence. Missing adapter scope (such as rich presentations or complex spreadsheet formulas) remains code work, not a credential issue. No prices are cost-validated, no new offer activation is claimed, and no real customer or profit is evidenced by these tests.
