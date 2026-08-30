# WhatsApp order notifications

Sends a WhatsApp message via Twilio when an order is placed (to the customer
and to the admin) and when an order's status changes (to the customer).
Reacts to Firestore writes that the site already makes — no frontend changes
needed.

## 1. Upgrade to the Blaze plan

Cloud Functions don't run on the free Spark plan at all.

Firebase console → your project → **Usage and billing** → **Modify plan** →
Blaze. You're still on a real free tier underneath this; you only pay for
usage beyond it, and this function's volume (a couple of messages per order)
will cost close to nothing on Firebase's side. The actual per-message cost
is Twilio's, not Firebase's — see step 2.

## 2. Create a Twilio account and get WhatsApp sending

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio).
2. In the console, go to **Messaging → Try it out → Send a WhatsApp message**
   to activate the **WhatsApp sandbox** — this lets you send/receive
   immediately for testing, but only to phone numbers that have joined your
   sandbox (you'll join it yourself by sending the given code to the given
   number from your own WhatsApp).
3. Note down, from the Twilio console:
   - **Account SID**
   - **Auth Token**
   - The **sandbox WhatsApp number** (looks like `whatsapp:+14155238886`)
4. When you're ready to message real customers (not just sandbox-joined
   numbers), apply for a production WhatsApp sender in Twilio's console —
   this requires Meta's business verification and takes longer. Swap
   `TWILIO_WHATSAPP_FROM` to the approved number once that's done; no code
   changes needed.

## 3. Install the Firebase CLI and log in

```bash
npm install -g firebase-tools
firebase login
```

## 4. Set the secrets

Run each of these from the project root (answers get stored encrypted by
Google Cloud Secret Manager, not in this repo):

```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
firebase functions:secrets:set ADMIN_WHATSAPP_TO
```

- `TWILIO_WHATSAPP_FROM` — the full `whatsapp:+1...` sandbox number from
  step 2, or your approved sender later.
- `ADMIN_WHATSAPP_TO` — the phone number (E.164 format, e.g. `+94771234567`)
  that should receive new-order alerts. While using the sandbox, this
  number must have joined the sandbox itself.

## 5. Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Known limitation

The checkout form's phone field is free text with no country-code
enforcement — a customer who enters a local-format number (e.g.
`0771234567` instead of `+94771234567`) won't receive a WhatsApp message,
since Twilio requires the international `+countrycode` format. The function
skips sending (and logs a warning) rather than guessing a country code or
failing the whole notification. Worth adding phone-format validation to the
checkout form if this comes up in practice.
