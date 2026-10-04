# ULTRON Revenue Studio

Public storefront: https://ultron-web-production-ffe0.up.railway.app/

The Node server serves public/index.html. Railway deploys main with node server.js and checks /health. PORT is provided by Railway. Run locally with npm start.

The storefront links the existing $29 Booking Starter Kit on Payhip, the Payhip contact form, and the existing scoped consulting services. Payhip/PayPal handle external checkout; this server does not process or transfer funds.

/api/leads deliberately returns 503 because this service has no durable inquiry storage. The linked contact form is the supported inquiry destination. /checkout redirects only to the fixed Payhip product; /api/payment-status reports external checkout availability separately from payment verification.

No bank details, credentials, orders, personal customer records or authenticated payment callbacks are stored in this repository. A public store or a payment link does not prove payment, delivery, settlement or revenue. Paid acceptance and payout checks remain required.

The server exposes only the storefront and explicit public routes, never repository source or environment values.
