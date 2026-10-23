# Instagram source integration review

Base inspected: 1da8362d9f7cc0b093c6369418ab28b20c4512fc (main, PR #62).
Sources were inspected through the owner's already authenticated Instagram browser.
Original uploaded recordings remain unresolved; this is complete original-carousel visual inspection, not recording/audio verification. No spoken explanation is attributed to either recording.

## Exact sources and coverage

A: https://www.instagram.com/p/DehA61ckoJh/ — October 15, 2026. All eight slides inspected sequentially at readable resolution. Slide 2 image and wording match the supplied screenshot.
B: https://www.instagram.com/p/DexM5YOjNaG/ — displayed one day ago on inspection. All fifteen slides inspected sequentially at readable resolution. Slide 1 matches the screenshot.
Classification authority: https://www.msci.com/indexes/index-resources/gics and https://www.msci.com/documents/1296102/11185224/GICS%2BSector%2BDefinitions%2B2023.pdf (definitions effective March 17, 2023).

## Source mapping and disposition

| Item | Observed topic | Practical implementation / disposition |
|---|---|---|
| A1 | Introduction to forms of intelligence | Context for lab; no intelligence score or unsupported ranking |
| A2 | Unreasonable optimism | Hypothesis, customer benefit, first action, success metric |
| A3 | Pattern recognition | Saved experiment observations and outcomes for comparison; no automated pattern accuracy claim |
| A4 | Quiet discernment | Evidence, baseline references, owner-reported labels; no claim becomes verified revenue |
| A5 | Deep curiosity | Counter evidence and unresolved uncertainty required in review |
| A6 | Strategic detachment | Deadline, planning budget, stop condition and STOP/REVISE decision |
| A7 | Metacognition | Versioned decision review; no AI consciousness claim |
| A8 | Follow-page invitation | Context; no automatic follow, publishing or copied artwork |
| B1 | Eleven-sector introduction and loss claim | Sector directory; unsupported causal loss claim excluded |
| B2 | Sector pie and list | Eleven sectors; undated benchmark weights excluded |
| B3 | Technology | Information Technology directory entry |
| B4 | Health care | Health Care directory entry |
| B5 | Financials | Financials directory entry |
| B6 | Discretionary spending | Consumer Discretionary directory entry |
| B7 | Staples | Consumer Staples directory entry |
| B8 | Energy | Energy directory entry; renewable generation not generalized into Energy |
| B9 | Industrials | Industrials directory entry |
| B10 | Materials | Materials directory entry |
| B11 | Utilities | Utilities directory entry |
| B12 | Real estate | Real Estate directory entry; equity and mortgage REIT distinction preserved through official authority |
| B13 | Communications | Communication Services directory entry |
| B14 | Bitcoin bonus | Separate CRYPTO watchlist type with null equity sector |
| B15 | Research before portfolio decisions | Dated source notes and watchlist; no financial order execution |

Both captions inspected. A describes six thinking practices; B argues for studying sector differences. Those statements do not establish scientific intelligence rankings, returns, verified sector performance or causation. A's artwork is decorative illustration, not a software capability. B's sector photographs illustrate industries; its pie is not a dated verified allocation. No external imagery is copied into ULTRON.

## Corrections

The technology slide includes Meta, which also appears in communications. Company examples must be verified independently; source lists are not authoritative classifications. Technology and staples lists headed “Top 10” contain fewer names. Activision appears as a standalone example without current listing evidence. No source ranking or ticker universe is imported. Bitcoin is not a GICS equity sector. Renewable electricity generation is included in Utilities in the referenced definition. Drivers and risks in the app are explicitly ULTRON research commentary, not guaranteed cycle rules.

## Architecture and verification

`/source-lab` extends the existing workbench navigation. Public catalog is educational; private experiment and watchlist endpoints reuse existing owner authorization and transactional PostgreSQL JSON state storage. No destructive schema migration is required. Request bodies are bounded, errors sanitized, updates require matching versions, and identical save retries are idempotent. Budget fields do not authorize spend. Business references are owner supplied and explicitly unverified. Existing payment and delivery ledgers remain authoritative; this feature does not create payments, customers or orders.

Acceptance: all 23 items appear in the mapping; eleven unique sectors; search and comparison render; unauthorized private reads/writes rejected; drafts survive reload; stale edits fail; STOP review persists; research notes preserve source/date and stale flag; crypto cannot use an equity sector; no feed means UNAVAILABLE with null timestamp/provider. Full original-recording inspection remains an open source dependency.
