/**
 * WhatsApp order notifications for Ambrosia Ceylon.
 *
 * Two Firestore triggers, both purely reactive — nothing in the frontend
 * (Checkout.jsx, Admin/Orders.jsx) needs to change. They already write to
 * the `orders` collection; these functions just watch for it.
 *
 *   - notifyOnOrderCreated:      fires once when a new order document is
 *                                created. Messages the customer (order
 *                                confirmed) and the admin (new order alert).
 *   - notifyOnOrderStatusChanged: fires when an existing order's `status`
 *                                field changes value. Messages the customer
 *                                with a status-specific update.
 *
 * Requires the Blaze (pay-as-you-go) plan — Cloud Functions cannot run on
 * the free Spark plan.
 *
 * Required secrets (set once via `firebase functions:secrets:set NAME`,
 * never hardcoded here — see functions/README.md):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   e.g. "whatsapp:+14155238886" (Twilio sandbox
 *                          number) or your approved WhatsApp sender
 *   ADMIN_WHATSAPP_TO      e.g. "+94771234567" — where new-order alerts go
 */

const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

const TWILIO_ACCOUNT_SID = defineSecret('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = defineSecret('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM = defineSecret('TWILIO_WHATSAPP_FROM');
const ADMIN_WHATSAPP_TO = defineSecret('ADMIN_WHATSAPP_TO');

const SECRETS = [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, ADMIN_WHATSAPP_TO];

/**
 * Sends one WhatsApp message. Swallows and logs errors rather than
 * throwing, so one bad phone number (e.g. missing country code from the
 * checkout form) never prevents the rest of an order's notifications, or
 * retries the whole function forever.
 */
async function sendWhatsApp(toRaw, body) {
    const to = normalizePhone(toRaw);
    if (!to) {
        logger.warn('Skipping WhatsApp send - no usable phone number', { toRaw });
        return;
    }
    const client = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());
    try {
        await client.messages.create({
            from: TWILIO_WHATSAPP_FROM.value(),
            to: `whatsapp:${to}`,
            body,
        });
    } catch (err) {
        logger.error('WhatsApp send failed', { to, error: err.message });
    }
}

/**
 * Very light phone normalization: Twilio requires E.164 (+countrycode...).
 * The checkout form is free text with no country-code enforcement, so this
 * only handles the common case (already has a leading +) and otherwise
 * gives up rather than guessing a country code.
 */
function normalizePhone(raw) {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    return trimmed.startsWith('+') ? trimmed.replace(/[^\d+]/g, '') : null;
}

function shortId(orderId) {
    return orderId.slice(0, 8).toUpperCase();
}

function formatTotal(order) {
    const amount = Number(order.total) || 0;
    return amount.toFixed(2);
}

exports.notifyOnOrderCreated = onDocumentCreated(
    { document: 'orders/{orderId}', secrets: SECRETS },
    async (event) => {
        const order = event.data?.data();
        if (!order) return;
        const id = shortId(event.params.orderId);
        const total = formatTotal(order);

        await sendWhatsApp(
            order.phone,
            `Hi ${order.firstName || 'there'}, thanks for your order! Order #${id} is confirmed - total $${total}. We'll message you again once it ships.`
        );

        await sendWhatsApp(
            ADMIN_WHATSAPP_TO.value(),
            `New order #${id} from ${[order.firstName, order.lastName].filter(Boolean).join(' ') || 'a customer'} - $${total}.`
        );
    }
);

exports.notifyOnOrderStatusChanged = onDocumentUpdated(
    { document: 'orders/{orderId}', secrets: SECRETS },
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();
        if (!before || !after || before.status === after.status) return;

        const id = shortId(event.params.orderId);
        const messages = {
            Shipped: `Your order #${id} has shipped!${after.trackingNumber ? ` Tracking number: ${after.trackingNumber}` : ''}`,
            Delivered: `Your order #${id} has been delivered. We hope you enjoy it!`,
            Cancelled: `Your order #${id} has been cancelled.`,
            Refunded: `Your order #${id} has been refunded.`,
        };
        const body = messages[after.status] || `Your order #${id} status is now: ${after.status}.`;

        await sendWhatsApp(after.phone, body);
    }
);
