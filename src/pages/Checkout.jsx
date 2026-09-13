import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency, EXCHANGE_RATES } from '../context/CurrencyContext';
import { db, functions } from '../firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import emailjs from '@emailjs/browser';
import './Checkout.css';

const ADMIN_NOTIFICATION_EMAIL = 'ambrosiaceylon@gmail.com';

// Publishable keys are safe to expose client-side by design — set the real
// one in a .env file as VITE_STRIPE_PUBLISHABLE_KEY (see functions/README.md).
// Left unset, Elements just renders nothing rather than crashing the page.
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');

const Checkout = () => {
    const { cartItems, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        // Redirect if cart empty, but render null to avoid flash
        setTimeout(() => navigate('/cart'), 0);
        return null;
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                mode: 'payment',
                // For Stripe Elements' own UI decisions only (e.g. which payment
                // methods to show) — the amount actually charged is always
                // recomputed server-side from real product prices at submit time.
                amount: Math.max(50, Math.round((cartTotal + 10) * 100)),
                currency: 'usd',
            }}
        >
            <CheckoutForm />
        </Elements>
    );
};

const CheckoutForm = () => {
    const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
    const { formatPrice, currency } = useCurrency();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        shippingMethod: 'standard'
    });

    const [shippingCost, setShippingCost] = useState(10);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleShippingChange = (method, cost) => {
        setFormData(prev => ({ ...prev, shippingMethod: method }));
        setShippingCost(cost);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setPaymentError('');
        setIsLoading(true);

        // Robust Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            alert("Kindly provide a valid email address.");
            setIsLoading(false);
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip || !formData.country) {
            alert("Please complete all required fields for delivery.");
            setIsLoading(false);
            return;
        }

        if (!stripe || !elements) {
            // Stripe.js hasn't finished loading yet — shouldn't normally happen
            // since the button is disabled until it has.
            setPaymentError('Payment is still loading. Please try again in a moment.');
            setIsLoading(false);
            return;
        }

        // Charge the card first. The order is only created — and stock only
        // decremented — once Stripe confirms the payment actually succeeded.
        let paymentIntentId;
        try {
            const { data } = await createPaymentIntent({
                items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
                shippingCost,
            });

            const { error: submitError } = await elements.submit();
            if (submitError) {
                setPaymentError(submitError.message || 'Please check your card details.');
                setIsLoading(false);
                return;
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret: data.clientSecret,
                confirmParams: { return_url: window.location.href },
                redirect: 'if_required',
            });

            if (confirmError) {
                setPaymentError(confirmError.message || 'Your payment could not be processed.');
                setIsLoading(false);
                return;
            }

            if (paymentIntent.status !== 'succeeded') {
                setPaymentError(`Payment ${paymentIntent.status.replace(/_/g, ' ')} — please try again.`);
                setIsLoading(false);
                return;
            }

            paymentIntentId = paymentIntent.id;
        } catch (err) {
            console.error('Payment failed:', err);
            setPaymentError(err.message || 'We could not process your payment. Please try again.');
            setIsLoading(false);
            return;
        }

        // Create the order and decrement inventory atomically — either both happen or
        // neither does, so a missing/deleted product can't leave a phantom "Paid" order
        // behind with stock never touched and the customer's cart stuck forever.
        const lowStockAlerts = [];

        try {
            const orderRef = doc(collection(db, 'orders'));

            await runTransaction(db, async (transaction) => {
                const productRefs = cartItems.map(item => doc(db, 'products', item.id));
                const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                const missing = productSnaps
                    .map((snap, i) => (snap.exists() ? null : cartItems[i]))
                    .filter(Boolean);

                if (missing.length > 0) {
                    const err = new Error('Some items in your cart are no longer available.');
                    err.missingItems = missing;
                    throw err;
                }

                productSnaps.forEach((snap, i) => {
                    const currentStock = Number(snap.data().stock) || 0;
                    const newStock = currentStock - cartItems[i].quantity;
                    transaction.update(productRefs[i], { stock: newStock });

                    // Admin sets this per-product in the Products panel (defaults to 10).
                    const reorderPoint = Number(snap.data().reorderPoint) || 10;
                    if (newStock <= reorderPoint) {
                        lowStockAlerts.push({ name: cartItems[i].name, stock: newStock });
                    }
                });

                transaction.set(orderRef, {
                    ...formData,
                    items: cartItems.length,
                    total: finalTotal,
                    cart: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
                    status: 'New', // Pending, Processing, etc.
                    paymentStatus: 'Paid',
                    stripePaymentIntentId: paymentIntentId,
                    fulfillmentStatus: 'Pending',
                    created_at: serverTimestamp(),
                    user: formData.email,
                    originalCurrency: currency,
                    exchangeRate: EXCHANGE_RATES[currency] || 1,
                });
            });

            // Alert the admin about anything that just dropped to/below its reorder
            // point, so they know to restock — doesn't block the order succeeding.
            if (lowStockAlerts.length > 0) {
                try {
                    const lines = lowStockAlerts.map(a => `${a.name}: ${a.stock} left`).join('\n');
                    await emailjs.send(
                        'service_vnv2zdj',
                        'template_fcosgki',
                        {
                            to_name: 'Ambrosia Admin',
                            to_email: ADMIN_NOTIFICATION_EMAIL,
                            subject: 'Low Stock Alert',
                            message: `These items are running low — stock up on the site:\n\n${lines}`
                        },
                        'BsB9Xsr8nr5Yo-WuD'
                    );
                } catch (stockAlertError) {
                    console.error('Failed to send low-stock alert:', stockAlertError);
                }
            }

            // Send Confirmation Email via EmailJS
            try {
                // EmailJS Configuration
                const serviceID = 'service_vnv2zdj'; // Shared Service ID
                const templateID = 'template_fcosgki';
                const publicKey = 'BsB9Xsr8nr5Yo-WuD'; // Shared Public Key

                // construct HTML rows for the email
                const orderItemsHtml = cartItems.map(item => {
                    // Robust absolute URL generation for email clients
                    let imageUrl = item.image;

                    if (imageUrl && !imageUrl.startsWith('http')) {
                        const origin = window.location.origin;
                        const base = '/Ambrosia/';

                        // Strip base if it already exists to avoid duplication
                        let cleanPath = imageUrl;
                        if (cleanPath.startsWith(base)) {
                            cleanPath = cleanPath.substring(base.length);
                        }

                        // Construct final absolute URL
                        imageUrl = `${origin}${base}${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
                    }

                    console.log(`[Email Debug] Item: ${item.name}, Generated Image URL: ${imageUrl}`);

                    return `
                    <tr style="vertical-align: top">
                        <td style="padding: 24px 8px 0 4px; width: 64px;">
                            <img width="64" height="64" style="height: 64px; width: 64px; object-fit: cover; border-radius: 4px;" src="${imageUrl}" alt="${item.name}" />
                        </td>
                        <td style="padding: 24px 8px 0 8px;">
                            <div style="font-family: 'Playfair Display', serif; font-size: 16px; color: #1a1a1a;">${item.name}</div>
                            <div style="font-size: 14px; color: #888; padding-top: 4px">Qty: ${item.quantity} × $${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                        <td style="padding: 24px 4px 0 0; white-space: nowrap; text-align: right;">
                            <strong style="color: #5b0e22;">$${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                    </tr>
                `;
                }).join('');

                const templateParams = {
                    to_name: formData.firstName,
                    to_email: formData.email,
                    order_id: orderRef.id,
                    order_items_html: orderItemsHtml, // Injected HTML table rows
                    shipping_cost: shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    total_cost: finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    message: `We are preparing your divine essence for dispatch.`
                };

                await emailjs.send(serviceID, templateID, templateParams, publicKey);
                console.log("Customer confirmation email sent successfully");

                // Also alert the store admin that a new order came in
                const adminParams = {
                    ...templateParams,
                    to_name: 'Ambrosia Admin',
                    to_email: ADMIN_NOTIFICATION_EMAIL,
                    message: `New order placed by ${formData.firstName} ${formData.lastName} (${formData.email}).`
                };
                await emailjs.send(serviceID, templateID, adminParams, publicKey);
                console.log("Admin new-order notification sent successfully");
            } catch (emailError) {
                console.error("Failed to send order email:", emailError);
                // Don't block the success flow if email fails
            }

            setIsLoading(false);
            clearCart();
            // Pass real order ID
            navigate('/order-confirmation', { state: { orderId: orderRef.id } });

        } catch (error) {
            console.error("Order failed:", error);
            // The card has already been charged at this point (paymentIntentId is set) —
            // this only fails on a genuinely rare race (a cart item vanished in the
            // moment between charging the card and writing the order). Surface the
            // payment reference so support can find and refund the charge.
            const refNote = paymentIntentId ? ` Your payment reference is ${paymentIntentId} — please contact us and we'll sort out a refund.` : '';
            if (error.missingItems?.length) {
                error.missingItems.forEach(item => removeFromCart(item.id));
                const names = error.missingItems.map(item => item.name).join(', ');
                alert(`Sorry, these item(s) are no longer available and have been removed from your cart: ${names}.${refNote}`);
            } else {
                alert(`Failed to place order. Please try again.${refNote}`);
            }
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0) {
        // Redirect if cart empty, but render null to avoid flash
        setTimeout(() => navigate('/cart'), 0);
        return null;
    }

    const finalTotal = cartTotal + shippingCost;

    return (
        <div className="checkout-page py-24">
            <div className="container">
                <h1 className="text-4xl font-heading text-gold mb-12 pb-6 border-b-2 border-white/10">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="checkout-grid grid grid-cols-2 gap-16">
                    <div className="checkout-form">
                        {/* Shipping Info */}
                        <section className="checkout-section mb-16">
                            <span className="checkout-eyebrow">01 — Delivery details</span>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <input
                                    type="text" name="firstName" placeholder="First Name"
                                    className="form-input" required
                                    value={formData.firstName} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="lastName" placeholder="Last Name"
                                    className="form-input" required
                                    value={formData.lastName} onChange={handleInputChange}
                                />
                                <input
                                    type="email" name="email" placeholder="Email Address"
                                    className="form-input col-span-2" required
                                    value={formData.email} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="address" placeholder="Address"
                                    className="form-input col-span-2" required
                                    value={formData.address} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="city" placeholder="City"
                                    className="form-input" required
                                    value={formData.city} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="state" placeholder="State / Province"
                                    className="form-input"
                                    value={formData.state} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="zip" placeholder="Postal Code"
                                    className="form-input" required
                                    value={formData.zip} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="country" placeholder="Country"
                                    className="form-input" required
                                    value={formData.country} onChange={handleInputChange}
                                />
                                <input
                                    type="tel" name="phone" placeholder="Contact Number (for delivery)"
                                    className="form-input col-span-2" required
                                    value={formData.phone} onChange={handleInputChange}
                                />
                            </div>
                        </section>

                        {/* Shipping Method */}
                        <section className="checkout-section mb-16">
                            <span className="checkout-eyebrow">02 — Shipping method</span>
                            <div className="shipping-options mt-6 border-t border-white/10">
                                <label className={`shipping-option ${formData.shippingMethod === 'standard' ? 'active' : ''}`}>
                                    <input
                                        type="radio" name="shipping"
                                        checked={formData.shippingMethod === 'standard'}
                                        onChange={() => handleShippingChange('standard', 10)}
                                    />
                                    <span className="shipping-option-label">Standard (5–10 days)</span>
                                    <span className="shipping-option-price">{formatPrice(10)}</span>
                                </label>
                                <label className={`shipping-option ${formData.shippingMethod === 'express' ? 'active' : ''}`}>
                                    <input
                                        type="radio" name="shipping"
                                        checked={formData.shippingMethod === 'express'}
                                        onChange={() => handleShippingChange('express', 25)}
                                    />
                                    <span className="shipping-option-label">Express (2–3 days)</span>
                                    <span className="shipping-option-price">{formatPrice(25)}</span>
                                </label>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="checkout-section mb-16">
                            <span className="checkout-eyebrow">03 — Payment method</span>
                            <div className="card-details mt-6">
                                {STRIPE_PUBLISHABLE_KEY ? (
                                    <PaymentElement />
                                ) : (
                                    <div className="checkout-note">
                                        Payments aren't configured yet — set VITE_STRIPE_PUBLISHABLE_KEY (see functions/README.md).
                                    </div>
                                )}
                                {paymentError && <p className="checkout-payment-error">{paymentError}</p>}
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={isLoading || !stripe || !elements}
                            className={`btn w-full py-5 text-sm uppercase tracking-widest ${isLoading || !stripe ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Processing...' : `Pay ${formatPrice(finalTotal)}`}
                        </button>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="order-summary sticky top-32">
                            <span className="checkout-eyebrow">Order summary</span>
                            <div className="order-items mt-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="order-item-row">
                                        <div className="item-thumbnail-mini">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="order-item-info">
                                            <p className="order-item-name">{item.name}</p>
                                            <p className="order-item-qty">Qty {item.quantity}</p>
                                        </div>
                                        <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{formatPrice(shippingCost)}</span>
                                </div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
