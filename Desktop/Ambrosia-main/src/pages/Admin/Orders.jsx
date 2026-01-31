import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Search, Package, Truck, CheckCircle, Clock, Mail, Trash2 } from 'lucide-react';
import './Admin.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingInput, setTrackingInput] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.created_at?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                    paymentStatus: data.paymentStatus || 'Paid',
                    fulfillmentStatus: data.status || 'Pending',
                    trackingNumber: data.trackingNumber || ''
                };
            });
            ordersData.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)); // Sort new to old
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
                status: 'Shipped' // Auto update status to shipped if tracking is added
            });
            setTrackingInput('');
            setSelectedOrder(null);
        } catch (error) {
            alert("Failed to save tracking: " + error.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'status-badge pending';
            case 'Processing': return 'status-badge processing';
            case 'Shipped': return 'status-badge processing';
            case 'Delivered': return 'status-badge completed';
            case 'Cancelled': return 'status-badge cancelled';
            default: return 'status-badge';
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'All' || o.fulfillmentStatus === filter;
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex flex-col pb-20 space-y-12 animate-fade-in">
            <div className="admin-header flex-row items-end justify-between">
                <div>
                    <h1 className="admin-title">Order <span className="highlight">Registry</span></h1>
                    <p className="admin-subtitle opacity-70 mt-2">Secured Transaction Ledger & Distribution Flow</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search Ledger..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-xs text-white focus:outline-none focus:border-gold w-full sm:w-64 transition-all font-medium"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 focus:outline-none focus:border-gold cursor-pointer transition-all"
                    >
                        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
                            <option key={f} value={f} className="bg-[#050505]">{f === 'All' ? 'Status: All' : f}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Orders List */}
                <div className={`flex-1 transition-all duration-500 w-full ${selectedOrder ? 'hidden lg:block opacity-30 pointer-events-none scale-[0.98]' : ''}`}>
                    <div className="admin-table-container">
                        <table className="admin-table min-w-[1000px]">
                            <thead>
                                <tr>
                                    <th className="pl-8">Registry ID</th>
                                    <th>Identity</th>
                                    <th>Timestamp</th>
                                    <th>Valuation</th>
                                    <th>Current Phase</th>
                                    <th className="pr-8 text-right">Interaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="p-24 text-center text-gold/30 text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Distributed Ledger...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan="6" className="p-24 text-center text-gray-600 text-[10px] uppercase tracking-[0.5em]">No matching transactions recorded</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-gold/[0.05]' : ''}`}
                                        >
                                            <td className="pl-8 font-mono text-[11px] font-bold text-gold/80">#{order.id.slice(0, 8).toUpperCase()}</td>
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold font-bold text-xs group-hover:bg-gold group-hover:text-black transition-all duration-500 shadow-lg">
                                                        {order.firstName ? order.firstName.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <span className="text-xs font-bold text-white tracking-tight">{order.firstName} {order.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{order.date}</td>
                                            <td className="text-xs font-black text-white">${Number(order.total).toFixed(2)}</td>
                                            <td>
                                                <span className={getStatusStyle(order.fulfillmentStatus)}>
                                                    {order.fulfillmentStatus}
                                                </span>
                                            </td>
                                            <td className="pr-8 text-right">
                                                <button className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-gold transition-all duration-300 py-2 border-b border-transparent group-hover:border-gold">
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel Details - Redesigned and Responsive */}
                {selectedOrder && (
                    <div className="w-full lg:w-[480px] admin-card flex flex-col animate-slide-in-right !p-0 overflow-hidden sticky top-32">
                        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-gold/5 backdrop-blur-xl shrink-0">
                            <div>
                                <h2 className="text-2xl font-heading text-white">Record <span className="text-gold">Detail</span></h2>
                                <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] font-medium opacity-60">AUTH-{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-600 hover:text-white transition-all text-xl">
                                &times;
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar max-h-[calc(100vh-200px)]">
                            {/* Profile Snapshot */}
                            <div className="text-center relative py-2">
                                <div className="w-24 h-24 bg-gradient-to-br from-gold/30 via-gold/10 to-transparent rounded-[2rem] mx-auto flex items-center justify-center text-3xl text-white font-heading mb-6 border border-gold/20 ring-[10px] ring-gold/5 shadow-2xl">
                                    {selectedOrder.firstName?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-heading text-white text-2xl mb-2">{selectedOrder.firstName} {selectedOrder.lastName}</h3>
                                <p className="text-[11px] text-gold/60 uppercase tracking-[0.4em] font-black mb-8 italic">{selectedOrder.email}</p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => window.location.href = `tel:${selectedOrder.phone}`}
                                        className="btn-ghost !p-3 !rounded-xl hover:text-gold"
                                    >
                                        <Truck size={16} />
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `mailto:${selectedOrder.email}`}
                                        className="btn-ghost !p-3 !rounded-xl hover:text-gold"
                                    >
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Logistics Map */}
                            <div className="bg-white/[0.02] p-6 rounded-3xl border border-gold/10 space-y-5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-all duration-700"></div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Distribution Hub</h4>
                                    <p className="text-xs text-gray-300 leading-loose font-medium">
                                        {selectedOrder.address}<br />
                                        <span className="text-white/60 font-bold tracking-tight">{selectedOrder.city}, {selectedOrder.country}</span>
                                    </p>
                                </div>
                                <div className="pt-5 border-t border-white/5">
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Direct Liaison</h4>
                                    <p className="text-xs text-white font-mono tracking-widest">{selectedOrder.phone}</p>
                                </div>
                            </div>

                            {/* Cart Manifest */}
                            <div className="space-y-6">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-4 ml-1">Acquired Inventory</h4>
                                <div className="space-y-4">
                                    {selectedOrder.cart?.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-white/5 rounded-xl flex-shrink-0 border border-white/10 overflow-hidden shadow-xl">
                                                <img src={item.image} alt="" className="w-full h-full object-cover opacity-60" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white mb-1">{item.name}</p>
                                                <p className="text-[10px] text-gold/40 font-black tracking-[0.1em] uppercase">{item.quantity} Unit(s) × ${item.price}</p>
                                            </div>
                                            <span className="text-sm font-black text-white italic">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-gold/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] font-black mb-2">Aggregate Valuation</p>
                                        <span className="text-[10px] text-gold/40 font-bold italic tracking-tighter">Verified Secure Transaction</span>
                                    </div>
                                    <span className="text-4xl font-heading text-white tracking-tighter shadow-gold/20 shadow-2xl">${selectedOrder.total}</span>
                                </div>
                            </div>

                            {/* Phase Controls */}
                            <div className="space-y-5">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 ml-1">Phase Management</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                                            className={`px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border transition-all duration-500 ${selectedOrder.fulfillmentStatus === status
                                                ? 'bg-gold text-black border-gold shadow-[0_10px_20px_rgba(212,175,55,0.2)]'
                                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-gold/30 hover:bg-gold/5'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Logistics Key */}
                            <div className="pt-6">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-4 ml-1">Tracking Registry</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="Identification Reference..."
                                        className="flex-1 text-xs font-mono bg-black/60 border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-gold/50 transition-all shadow-inner"
                                    />
                                    <button
                                        onClick={handleSaveTracking}
                                        className="btn-gold !px-6 !py-3 !text-[10px]"
                                    >
                                        Sync
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
