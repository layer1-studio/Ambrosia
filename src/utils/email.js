import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_vnv2zdj';
const PUBLIC_KEY = 'BsB9Xsr8nr5Yo-WuD';
const DEFAULT_TEMPLATE_ID = 'template_fcosgki';

/**
 * Sends an order status update email.
 * @param {Object} order - The order object.
 * @param {string} status - The new fulfillment status.
 * @param {string} trackingNumber - Optional tracking number.
 * @returns {Promise}
 */
export const sendStatusEmail = async (order, status, trackingNumber = '') => {
    try {
        let message = '';
        let subject = `Order Update: ${status}`;

        switch (status) {
            case 'Shipped':
                message = `Great news! Your divine essence has been shipped. ${trackingNumber ? `Your tracking number is ${trackingNumber}.` : ''} We hope it brings you joy.`;
                break;
            case 'Delivered':
                message = `Your order #${order.id.slice(0, 8).toUpperCase()} has been successfully delivered. We hope you enjoy the authentic Ceylon Cinnamon experience.`;
                break;
            case 'Cancelled':
                message = `Your order #${order.id.slice(0, 8).toUpperCase()} has been cancelled as requested.`;
                break;
            case 'Refunded':
                message = `We have processed a refund for your order #${order.id.slice(0, 8).toUpperCase()}. The funds should appear in your account soon.`;
                break;
            default:
                message = `The status of your order #${order.id.slice(0, 8).toUpperCase()} has been updated to ${status}.`;
        }

        const totalValue = Number(order.total) || 0;
        const recipientEmail = order.user || order.email || '';
        const recipientName = order.firstName || 'Customer';

        console.log(`[Email Debug] Preparing to send status email:`, {
            status,
            orderId: order.id,
            email: recipientEmail,
            total: totalValue
        });

        if (!recipientEmail) {
            console.error(`[Email Error] No email found for order ${order.id}. Skipping.`);
            return;
        }

        const templateParams = {
            to_name: recipientName,
            to_email: recipientEmail,
            order_id: order.id,
            total_cost: totalValue.toFixed(2),
            message: message,
            subject: subject,
            tracking_number: trackingNumber || 'N/A'
        };

        const response = await emailjs.send(SERVICE_ID, DEFAULT_TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log(`[Email Success] Status email sent for order ${order.id}: ${status}`);
        return response;
    } catch (error) {
        console.error(`[Email Error] Failed to send status email for order ${order.id}:`, error);
        throw error;
    }
};
