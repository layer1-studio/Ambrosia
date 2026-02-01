import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
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
        setIsLoading(true);

        // Robust Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            alert("Kindly provide a valid email address.");
            setIsLoading(false);
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.country) {
            alert("Please complete all required fields for delivery.");
            setIsLoading(false);
            return;
        }

        // Create Order in Firestore
        try {
            const orderRef = await addDoc(collection(db, 'orders'), {
                ...formData,
                items: cartItems.length,
                total: finalTotal,
                cart: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
                status: 'New', // Pending, Processing, etc.
                paymentStatus: 'Paid', // Simulating successful payment
                fulfillmentStatus: 'Pending',
                created_at: serverTimestamp(),
                user: formData.email
            });

            // Decrement Inventory for each item
            const batch = writeBatch(db);
            cartItems.forEach(item => {
                const productRef = doc(db, 'products', item.id);
                // Atomically decrement stock
                batch.update(productRef, {
                    stock: increment(-item.quantity)
                });
            });
            await batch.commit();

            // Send Confirmation Email via EmailJS
            try {
                // EmailJS Configuration
                const serviceID = 'service_vnv2zdj'; // Shared Service ID
                const templateID = 'template_fcosgki';
                const publicKey = 'BsB9Xsr8nr5Yo-WuD'; // Shared Public Key

                // construct HTML rows for the email
                const orderItemsHtml = cartItems.map(item => {
                    // Ensure image URL is absolute for email clients
                    const imageUrl = item.image.startsWith('http')
                        ? item.image
                        : `${window.location.origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`;

                    return `
                    <tr style="vertical-align: top">
                        <td style="padding: 24px 8px 0 4px; width: 64px;">
                            <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 4px;" src="${imageUrl}" alt="${item.name}" />
                        </td>
                        <td style="padding: 24px 8px 0 8px;">
                            <div style="font-family: 'Playfair Display', serif; font-size: 16px; color: #1a1a1a;">${item.name}</div>
                            <div style="font-size: 14px; color: #888; padding-top: 4px">Qty: ${item.quantity} × $${item.price}</div>
                        </td>
                        <td style="padding: 24px 4px 0 0; white-space: nowrap; text-align: right;">
                            <strong style="color: #D4AF37;">$${(item.price * item.quantity).toFixed(2)}</strong>
                        </td>
                    </tr>
                `;
                }).join('');

                const templateParams = {
                    to_name: formData.firstName,
                    to_email: formData.email,
                    order_id: orderRef.id,
                    order_items_html: orderItemsHtml, // Injected HTML table rows
                    shipping_cost: shippingCost.toFixed(2),
                    total_cost: finalTotal.toFixed(2),
                    message: `We are preparing your divine essence for dispatch.`
                };

                await emailjs.send(serviceID, templateID, templateParams, publicKey);
                console.log("Email sent successfully");
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                // Don't block the success flow if email fails
            }

            setIsLoading(false);
            clearCart();
            // Pass real order ID
            navigate('/order-confirmation', { state: { orderId: orderRef.id } });

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order. Please try again.");
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
        <div className="checkout-page py-32">
            <div className="container">
                <h1 className="text-5xl font-heading text-gold mb-12">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="checkout-grid grid grid-cols-2 gap-20">
                    <div className="checkout-form">
                        {/* Shipping Info */}
                        <section className="checkout-section mb-12">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Delivery Details</h2>
                            <div className="grid grid-cols-2 gap-6 mb-6">
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
                            </div>
                            <input
                                type="email" name="email" placeholder="Email Address"
                                className="form-input mb-6" required
                                value={formData.email} onChange={handleInputChange}
                            />
                            <input
                                type="text" name="address" placeholder="Address"
                                className="form-input mb-6" required
                                value={formData.address} onChange={handleInputChange}
                            />
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <input
                                    type="text" name="city" placeholder="City"
                                    className="form-input" required
                                    value={formData.city} onChange={handleInputChange}
                                />
                                <input
                                    type="text" name="country" placeholder="Country"
                                    className="form-input" required
                                    value={formData.country} onChange={handleInputChange}
                                />
                            </div>
                            <input
                                type="tel" name="phone" placeholder="Contact Number (for delivery)"
                                className="form-input mb-6" required
                                value={formData.phone} onChange={handleInputChange}
                            />
                        </section>

                        {/* Shipping Method */}
                        <section className="checkout-section mb-12">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Shipping Method</h2>
                            <div className="shipping-options space-y-4">
                                <label className={`shipping-option flex items-center justify-between p-4 bg-[#111] border rounded cursor-pointer ${formData.shippingMethod === 'standard' ? 'border-gold' : 'border-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio" name="shipping"
                                            checked={formData.shippingMethod === 'standard'}
                                            onChange={() => handleShippingChange('standard', 10)}
                                        />
                                        <span>Standard (5-10 Days)</span>
                                    </div>
                                    <span className="text-gold">$10.00</span>
                                </label>
                                <label className={`shipping-option flex items-center justify-between p-4 bg-[#111] border rounded cursor-pointer ${formData.shippingMethod === 'express' ? 'border-gold' : 'border-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio" name="shipping"
                                            checked={formData.shippingMethod === 'express'}
                                            onChange={() => handleShippingChange('express', 25)}
                                        />
                                        <span>Express (2-3 Days)</span>
                                    </div>
                                    <span className="text-gold">$25.00</span>
                                </label>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="checkout-section mb-12">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Payment Method</h2>
                            <div className="payment-tabs flex gap-4 mb-8">
                                <button
                                    type="button"
                                    className={`payment-tab flex-1 p-4 rounded border ${paymentMethod === 'card' ? 'border-gold text-gold bg-gold/5' : 'border-white/5 text-gray-400'}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    Credit Card
                                </button>
                                <button
                                    type="button"
                                    className={`payment-tab flex-1 p-4 rounded border ${paymentMethod === 'paypal' ? 'border-gold text-gold bg-gold/5' : 'border-white/5 text-gray-400'}`}
                                    onClick={() => setPaymentMethod('paypal')}
                                >
                                    PayPal
                                </button>
                            </div>

                            {paymentMethod === 'card' ? (
                                <div className="card-details space-y-6">
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm rounded">
                                        Note: This is a secure demonstration. No charges will be applied.
                                    </div>
                                    <input type="text" placeholder="Card Number" className="form-input" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <input type="text" placeholder="MM / YY" className="form-input" />
                                        <input type="text" placeholder="CVV" className="form-input" />
                                    </div>
                                </div>
                            ) : (
                                <div className="paypal-notice p-8 bg-blue-600/5 border border-blue-600/20 rounded text-center">
                                    <p className="text-gray-300">Complete your acquisition securely with PayPal.</p>
                                </div>
                            )}
                        </section>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn w-full py-5 text-lg uppercase tracking-widest mt-8 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="order-summary bg-[#111] p-10 rounded-lg border border-white/5 sticky top-32">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Order Summary</h2>
                            <div className="order-items space-y-6 mb-10 max-h-96 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="item-thumbnail-mini w-12 h-12 overflow-hidden rounded bg-gray-800">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-white text-xs font-heading leading-tight mb-1">{item.name}</p>
                                                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="text-gold text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-details pt-8 border-top border-white/10 space-y-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span>${shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl text-white font-heading font-bold pt-4 border-top border-white/5">
                                    <span>Total</span>
                                    <span className="text-gold">${finalTotal.toFixed(2)}</span>
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
