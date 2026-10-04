# Original product draft factory

`buildProduct(brief, {now})` creates an original six-section booking-operations HTML guide and a SHA-256 integrity manifest from a structured brief. It does not fetch source content, use AI credentials, publish externally, send customer messages or process payments.

Run:

```sh
node --test product-factory.test.mjs
node generate.mjs brief-example.json starter-output
```

The example is a useful draft with intake, exception and measurement worksheets plus five synthetic acceptance cases. The cited integration documentation supports integration limitations; it does **not** establish customer demand. Evidence validation checks reference structure only. The owner must verify sources, demand, rights, final quality and the offer before publication. No module can reliably prove originality merely from an acknowledgement.

Integration: store the draft and manifest as one versioned artifact; validate its hash before uploading; associate the actual uploaded attachment version, checkout product ID and price with the product record. Record publication success only from the destination's authenticated response. Payment and delivery evidence belong in separate records and never follow merely from product generation. Repeated factory calls with the same brief and generation time are deterministic.

The factory has no network calls. HTML interpolation is escaped and reference URLs accept HTTPS without credentials. Prices use bounded integer cents. Brief size, required fields, evidence count, distinct sources and observation timestamps have explicit gates.
