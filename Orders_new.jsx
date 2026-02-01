import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Search, Package, CheckCircle, Clock } from 'lucide-react';
import './Admin.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;
    const [trackingInput, setTrackingInput] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.created_at?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                    fulfillmentStatus: data.status || 'Pending',
                    trackingNumber: data.trackingNumber || ''
                };
            });
            ordersData.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        } catch (error) {
            alert("Update failed: " + error.message);
        }
    };

    const handleSaveTracking = async () => {
        if (!selectedOrder) return;
        try {
            await updateDoc(doc(db, "orders", selectedOrder.id), {
                trackingNumber: trackingInput,
                status: 'Shipped'
            });
            setTrackingInput('');
            setSelectedOrderId(null);
        } catch (error) {
            alert("Failed to save tracking: " + error.message);
        }
    };

    // New Minimal Status Component
    const StatusIndicator = ({ status }) => {
        const getStatusColor = (s) => {
            switch (s) {
                case 'Pending': return 'text-gold';
                case 'Shipped': return 'text-blue-400';
                case 'Delivered': return 'text-green-400';
                case 'Cancelled': return 'text-red-400';
                default: return 'text-gray-400';
            }
        };

        return (
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(status)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>
                {status}
            </div>
        );
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'All' || o.fulfillmentStatus === filter;
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div>
                    <h1 className="text-6xl md:text-7xl font-heading text-white tracking-tighter mb-4">Ledger</h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Transaction History</p>
                </div>

                <div className="flex gap-6 items-center">
                    <div className="relative group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-white/10 py-2 pl-6 pr-4 w-64 text-sm text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Minimal */}
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`text-[10px] uppercase tracking-[0.2em] font-bold pb-4 border-b-2 transition-all whitespace-nowrap ${filter === status ? 'border-gold text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="flex gap-12 items-start relative">
                {/* Main Table */}
                <div className={`flex-1 transition-all duration-500 ${selectedOrder ? 'w-2/3 opacity-40 pointer-events-none blur-sm' : 'w-full'}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-6 px-4 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Ref ID</th>
                                <th className="py-6 px-4 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Client</th>
                                <th className="py-6 px-4 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Date</th>
                                <th className="py-6 px-4 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold text-right">Amount</th>
                                <th className="py-6 px-4 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="py-24 text-center text-gold/30 text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="5" className="py-24 text-center text-gray-700 text-[10px] uppercase tracking-[0.5em]">No Records</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className="group cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]"
                                    >
                                        <td className="py-6 px-4 font-mono text-xs text-gold/70 group-hover:text-gold transition-colors">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="py-6 px-4">
                                            <p className="text-sm text-white font-heading">{order.firstName} {order.lastName}</p>
                                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">{order.user}</p>
                                        </td>
                                        <td className="py-6 px-4 text-xs text-gray-500 font-mono">{order.date}</td>
                                        <td className="py-6 px-4 text-sm font-bold text-white text-right">${Number(order.total).toFixed(2)}</td>
                                        <td className="py-6 px-4 flex justify-center">
                                            <StatusIndicator status={order.fulfillmentStatus} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sliding Detail Panel */}
                {selectedOrder && (
                    <div className="fixed top-24 right-0 h-[calc(100vh-6rem)] w-[500px] bg-[#080808] border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,0.8)] z-50 animate-slide-in-right overflow-y-auto custom-scrollbar p-12 flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold mb-2">Invoice Details</p>
                                <h2 className="text-3xl font-heading text-white">#{selectedOrder.id.slice(0, 8)}</h2>
                            </div>
                            <button onClick={() => setSelectedOrderId(null)} className="text-gray-500 hover:text-white transition-colors text-2xl">&times;</button>
                        </div>

                        <div className="space-y-12 flex-1">
                            {/* Profile */}
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl font-heading text-white">
                                    {selectedOrder.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl text-white font-heading">{selectedOrder.firstName} {selectedOrder.lastName}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{selectedOrder.email}</p>
                                    <p className="text-xs text-gray-500 font-mono">{selectedOrder.phone}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold border-b border-white/5 pb-2">Manifest</h4>
                                {selectedOrder.cart?.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden">
                                            <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-body">{item.name}</p>
                                            <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-mono text-gold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-4 border-t border-white/5">
                                    <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
                                    <span className="text-xl font-heading text-white">${selectedOrder.total}</span>
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold border-b border-white/5 pb-2">Logistics</h4>
                                <p className="text-sm text-gray-300 font-light leading-relaxed">
                                    {selectedOrder.address}<br />
                                    {selectedOrder.city}, {selectedOrder.country}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-6">
                                <h4 className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">Update Status</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                                            className={`py-3 px-4 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${selectedOrder.fulfillmentStatus === status ? 'bg-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="ADD TRACKING #"
                                        className="w-full bg-black border border-white/10 rounded-lg py-3 px-4 text-xs font-mono text-white focus:border-gold outline-none"
                                    />
                                    <button
                                        onClick={handleSaveTracking}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-gold hover:text-white transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
