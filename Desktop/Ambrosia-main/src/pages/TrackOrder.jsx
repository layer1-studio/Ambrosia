import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const docRef = doc(db, "orders", orderId.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Simple security check: Email must match
                if (data.email.toLowerCase() === email.toLowerCase()) {
                    setOrder({ id: docSnap.id, ...data });
                } else {
                    setError("Order found, but email does not match records.");
                }
            } else {
                setError("Order not found. Please check your Order ID.");
            }
        } catch (err) {
            console.error("Tracking Error:", err);
            setError("An error occurred while tracking. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="track-order-page py-32 min-h-[60vh]">
            <div className="container max-w-2xl mx-auto">
                <h1 className="text-4xl font-heading text-gold text-center mb-8">Track Your Order</h1>
                <p className="text-gray-400 text-center mb-12">Enter your Order ID and Email Address to see current status.</p>

                <form onSubmit={handleTrack} className="bg-[#111] p-8 rounded-xl border border-white/10 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Order ID</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-gold outline-none"
                                placeholder="e.g. 5xJ8..."
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-gold outline-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-black py-4 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors"
                    >
                        {loading ? 'Searching...' : 'Track Order'}
                    </button>
                    {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
                </form>

                {order && (
                    <div className="order-result bg-[#111] p-8 rounded-xl border border-gold/30 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl text-white font-heading">Order Status</h2>
                                <p className="text-gray-500 text-sm mt-1">Placed on {order.created_at?.toDate().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-4 py-2 rounded border text-xs uppercase font-bold tracking-widest ${order.status === 'Delivered' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                                        order.status === 'Shipped' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' :
                                            'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Shipping To</h3>
                                <p className="text-white">{order.firstName} {order.lastName}</p>
                                <p className="text-gray-400 text-sm">{order.address}</p>
                                <p className="text-gray-400 text-sm">{order.city}, {order.country}</p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Items ({order.items})</h3>
                                <ul className="space-y-2">
                                    {order.cart?.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex justify-between">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span className="text-gold">${item.price}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between font-bold text-white">
                                    <span>Total</span>
                                    <span>${order.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
