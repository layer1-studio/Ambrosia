import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="cart-page py-32">
                <div className="container text-center">
                    <h1 className="text-4xl font-heading text-gold mb-8">Your Cart is Empty</h1>
                    <p className="text-gray-400 mb-12">Looks like you haven't added the essence of Ceylon to your collection yet.</p>
                    <Link to="/shop" className="btn">Browse Shop</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page py-32">
            <div className="container">
                <h1 className="text-5xl font-heading text-gold mb-12">Your Selection</h1>

                <div className="cart-grid">
                    <div className="cart-items">
                        <div className="cart-header grid grid-cols-4 gap-4 text-xs uppercase tracking-widest text-gray-500 pb-4 border-bottom border-white/5 mb-8">
                            <div className="col-span-2">Product</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-right">Total</div>
                        </div>

                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item-row grid grid-cols-4 gap-4 items-center py-6 border-bottom border-white/5">
                                <div className="col-span-2 flex gap-6 items-center">
                                    <div className="item-thumbnail w-24 h-24 bg-[#111] overflow-hidden rounded">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-heading text-xl mb-1">{item.name}</h3>
                                        <p className="text-gold text-sm">${item.price.toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-600 text-xs mt-2 hover:text-red-500 transition-colors uppercase">Remove</button>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">-</button>
                                    <span className="text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                                </div>
                                <div className="text-right text-white font-bold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary bg-[#111] p-8 rounded-lg border border-white/5 h-fit">
                        <h2 className="text-2xl font-heading text-white mb-8">Summary</h2>
                        <div className="summary-row flex justify-between mb-4">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-white">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row flex justify-between mb-8 pb-8 border-bottom border-white/5">
                            <span className="text-gray-400">Shipping</span>
                            <span className="text-gold">Calculated at checkout</span>
                        </div>
                        <div className="summary-row flex justify-between mb-12">
                            <span className="text-xl text-white font-heading">Total</span>
                            <span className="text-xl text-gold font-bold">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="btn w-full text-center">Proceed to Checkout</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
