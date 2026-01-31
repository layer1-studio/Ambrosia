import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('card');

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        // Mock order placement
        setTimeout(() => {
            clearCart();
            navigate('/order-confirmation');
        }, 1000);
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-page py-32">
            <div className="container">
                <h1 className="text-5xl font-heading text-gold mb-12">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="checkout-grid grid grid-cols-2 gap-20">
                    <div className="checkout-form">
                        <section className="checkout-section mb-12">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Shipping Information</h2>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <input type="text" placeholder="First Name" className="form-input" required />
                                <input type="text" placeholder="Last Name" className="form-input" required />
                            </div>
                            <input type="email" placeholder="Email Address" className="form-input mb-6" required />
                            <input type="text" placeholder="Address" className="form-input mb-6" required />
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <input type="text" placeholder="City" className="form-input" required />
                                <input type="text" placeholder="Country" className="form-input" required />
                            </div>
                        </section>

                        <section className="checkout-section mb-12">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Shipping Method</h2>
                            <div className="shipping-options space-y-4">
                                <label className="shipping-option flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="shipping" defaultChecked />
                                        <span>Standard (5-10 Days)</span>
                                    </div>
                                    <span className="text-gold">$10.00</span>
                                </label>
                                <label className="shipping-option flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="shipping" />
                                        <span>Express (2-3 Days)</span>
                                    </div>
                                    <span className="text-gold">$25.00</span>
                                </label>
                            </div>
                        </section>

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
                                    <input type="text" placeholder="Card Number" className="form-input" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <input type="text" placeholder="MM / YY" className="form-input" />
                                        <input type="text" placeholder="CVV" className="form-input" />
                                    </div>
                                </div>
                            ) : (
                                <div className="paypal-notice p-8 bg-blue-600/5 border border-blue-600/20 rounded text-center">
                                    <p className="text-gray-300">Proceed to complete your purchase securely with PayPal.</p>
                                </div>
                            )}
                        </section>

                        <button type="submit" className="btn w-full py-5 text-lg uppercase tracking-widest mt-8">Place Order</button>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="order-summary bg-[#111] p-10 rounded-lg border border-white/5">
                            <h2 className="text-2xl font-heading text-white mb-8 border-bottom border-white/5 pb-4">Order Summary</h2>
                            <div className="order-items space-y-6 mb-10 max-h-96 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="item-thumbnail-mini">
                                                <img src={item.image} alt={item.name} />
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
                                    <span>$10.00</span>
                                </div>
                                <div className="flex justify-between text-xl text-white font-heading font-bold pt-4 border-top border-white/5">
                                    <span>Total</span>
                                    <span className="text-gold">${(cartTotal + 10).toFixed(2)}</span>
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
