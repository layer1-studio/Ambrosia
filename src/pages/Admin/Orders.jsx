import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Search, Mail, Trash2, X, MapPin, Phone, User, Filter } from 'lucide-react';
import { sendStatusEmail } from '../../utils/email';
import './Admin.css';

const Orders = () => {
    const { formatPrice, currencySymbols } = useCurrency();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;
    const [trackingInput, setTrackingInput] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dateFormatted: data.created_at?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || new Date().toLocaleDateString(),
                    fulfillmentStatus: data.status || 'Pending',
                    paymentStatus: data.paymentStatus || 'Paid',
                    trackingNumber: data.trackingNumber || ''
                };
            });
            ordersData.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedOrderId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedOrderId]);

    // Helper to format price based on order's original currency or fallback to admin's current
    const formatOrderPrice = (amount, order) => {
        if (order?.originalCurrency && order?.exchangeRate) {
            const sym = currencySymbols[order.originalCurrency] || '$';
            const val = (amount * order.exchangeRate).toFixed(2);
            return `${sym}${val}`;
        }
        return formatPrice(amount);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });

            // Send notification email for significant status changes
            const order = orders.find(o => o.id === orderId);
            console.log(`[Orders Debug] Status changed to ${newStatus} for order ${orderId}. Order found:`, !!order);
            if (order && ['Delivered', 'Cancelled', 'Refunded', 'Shipped'].includes(newStatus)) {
                await sendStatusEmail(order, newStatus);
            }
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

            // Send notification email for Shipped with tracking
            console.log(`[Orders Debug] Saving tracking for order ${selectedOrder.id}. Calling sendStatusEmail...`);
            await sendStatusEmail(selectedOrder, 'Shipped', trackingInput);
            setTrackingInput('');
            setSelectedOrderId(null);
            alert("Order #" + selectedOrder.id.slice(0, 8) + " marked as Shipped.");
        } catch (error) {
            alert("Failed to save tracking: " + error.message);
        }
    };

    const handlePrint = () => {
        if (!selectedOrder) return;
        const printWindow = window.open('', '_blank');
        const invoiceContent = `
            <html>
                <head>
                    <title>Invoice - ${selectedOrder.id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; align-items: center; }
                        .logo { color: #D4AF37; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; }
                        .invoice-info { text-align: right; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 40px; }
                        .section-title { color: #D4AF37; text-transform: uppercase; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding: 15px; border-bottom: 2px solid #f0f0f0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
                        td { padding: 15px; border-bottom: 1px solid #f8f8f8; font-size: 14px; }
                        .total-row { text-align: right; font-size: 20px; font-weight: bold; margin-top: 30px; border-top: 2px solid #D4AF37; padding-top: 15px; }
                        .footer { margin-top: 80px; text-align: center; color: #bbb; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Ambrosia</div>
                        <div class="invoice-info">
                            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">INVOICE</h1>
                            <p style="margin: 5px 0; font-family: monospace;">#ORD-${selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                            <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${selectedOrder.dateFormatted}</p>
                        </div>
                    </div>
                    
                    <div class="grid">
                        <div>
                            <div class="section-title">Customer Information</div>
                            <strong style="font-size: 16px;">${selectedOrder.firstName} ${selectedOrder.lastName}</strong><br>
                            ${selectedOrder.email}<br>
                            ${selectedOrder.phone || 'No phone provided'}
                        </div>
                        <div>
                            <div class="section-title">Shipping Logistics</div>
                            <p style="margin: 0;">${selectedOrder.address}</p>
                            <p style="margin: 0;">${selectedOrder.city}, ${selectedOrder.zip}</p>
                            <p style="margin: 10px 0 0; color: #D4AF37; font-size: 12px; font-weight: bold;">METHOD: Standard Delivery</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th style="text-align: center;">Quantity</th>
                                <th style="text-align: right;">Unit Price</th>
                                <th style="text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedOrder.cart?.map(item => `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td style="text-align: center;">${item.quantity || 1}</td>
                                    <td style="text-align: right;">${formatOrderPrice(item.price, selectedOrder)}</td>
                                    <td style="text-align: right;">${formatOrderPrice(item.price * (item.quantity || 1), selectedOrder)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-row">
                        <span style="font-size: 14px; color: #888; font-weight: normal; margin-right: 20px;">GRAND TOTAL</span>
                        ${formatOrderPrice(selectedOrder.total, selectedOrder)}
                    </div>

                    <div class="footer">
                        Authentic Ceylon Cinnamon • Curated by Divine Essence
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        // Wait for images if any (though we are using text names now)
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const scrollToStatus = () => {
        const element = document.getElementById('fulfillment-actions');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getStatusPill = (status) => {
        const s = status.toLowerCase();
        if (s === 'delivered' || s === 'completed') return 'success';
        if (s === 'pending' || s === 'processing') return 'warning';
        if (s === 'shipped') return 'info';
        if (s === 'new') return 'new-status'; // Custom class for new
        if (s === 'reviews') return 'reviews-status';
        if (s === 'cancelled' || s === 'refunded') return 'danger';
        return 'default';
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'All' || o.fulfillmentStatus === filter;
        if (!matchesFilter) return false;
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();
        const searchable = [
            o.id || '',
            (o.firstName || '') + ' ' + (o.lastName || ''),
            o.user || o.email || '',
            o.phone || ''
        ].join(' ').toLowerCase();
        return searchable.includes(term);
    });

    const filterPills = [
        { value: 'All', label: 'All' },
        { value: 'New', label: 'New' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Reviews', label: 'Reviews' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    const steps = ['New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Reviews'];
    const statusToStep = { New: 0, Pending: 1, Processing: 2, Shipped: 3, Delivered: 4, Reviews: 5 };
    const stepIndex = selectedOrder ? (statusToStep[selectedOrder.fulfillmentStatus] ?? 1) : 0;

    return (
        <>
            <div className="space-y-6 animate-reveal">
                <h1 className="admin-section-title admin-title text-2xl md:text-3xl font-heading text-gold">Orders</h1>

                <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                    <div className="flex flex-1 gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders by ID, name, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="admin-input w-full pl-11 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:border-gold/50"
                            />
                        </div>
                        <div className="relative w-48 shrink-0">
                            <Filter className="absolute left-10 top-1/2 -translate-y-1/2 text-gold pointer-events-none" size={16} />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="admin-input w-full pl-20 pr-10 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl appearance-none cursor-pointer focus:border-gold/50"
                            >
                                {filterPills.map(({ value, label }) => (
                                    <option key={value} value={value} className="bg-[#0a0a0a] text-white">{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className={`admin-table-wrapper glass-panel rounded-2xl border border-white/5 transition-all duration-300 ${selectedOrder ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer Name</th>
                                    <th>Date</th>
                                    <th>Payment Status</th>
                                    <th className="text-right">Total Amount</th>
                                    <th>Fulfillment Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                                                <span className="text-sm text-gray-500">Syncing with database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center text-gray-500 font-medium">
                                            No matching orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className="cursor-pointer group"
                                        >
                                            <td className="font-mono text-sm text-gold font-medium">ORD-{order.id.slice(0, 5).toUpperCase()}</td>
                                            <td className="text-white font-medium">{order.firstName} {order.lastName}</td>
                                            <td className="text-gray-400 text-sm">{order.dateFormatted}</td>
                                            <td>
                                                <span className={`status-pill ${order.paymentStatus === 'Paid' ? 'success' : 'danger'} ${order.paymentStatus === 'Paid' ? '!bg-gold/20 !text-gold' : ''}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="text-right text-gold font-medium">{formatOrderPrice(order.total, order)}</td>
                                            <td>
                                                <span className={`status-pill ${getStatusPill(order.fulfillmentStatus)} inline-flex items-center gap-1.5`}>
                                                    <span className={`w-2 h-2 rounded-full ${order.fulfillmentStatus === 'Delivered' ? 'bg-green-500' :
                                                        order.fulfillmentStatus === 'Shipped' ? 'bg-blue-500' :
                                                            order.fulfillmentStatus === 'New' ? 'bg-gold animate-pulse' :
                                                                order.fulfillmentStatus === 'Reviews' ? 'bg-purple-500' :
                                                                    'bg-amber-500'
                                                        }`} />
                                                    {order.fulfillmentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Refined Detail Modal - Using Portal to break out of all stacking contexts */}
                {selectedOrder && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                            onClick={() => setSelectedOrderId(null)}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />

                        {/* Modal Content */}
                        <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-gold/20 rounded-2xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
                            {/* Scrollable Body */}
                            <div className="overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">

                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-heading text-gold">Order #{selectedOrder.id.slice(0, 8).toUpperCase()} - {selectedOrder.fulfillmentStatus}</h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={scrollToStatus}
                                            className="btn-premium btn-premium-gold px-5 py-2.5 rounded-xl text-sm font-bold"
                                        >
                                            Update Status
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="btn-premium btn-premium-outline px-5 py-2.5 rounded-xl text-sm font-bold border-gold/30 text-gold hover:bg-gold/10"
                                        >
                                            Print Invoice
                                        </button>
                                        <button onClick={() => setSelectedOrderId(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors hover:bg-red-500/20 hover:text-red-500" aria-label="Close">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar - Ordered → Processing → Shipped → Delivered */}
                                <div className="admin-order-steps">
                                    {steps.map((step, i) => (
                                        <React.Fragment key={step}>
                                            <div className={`admin-order-step ${i <= stepIndex ? (i < stepIndex ? 'done' : 'active') : ''}`}>
                                                <div className="admin-order-step-dot" />
                                                <span>{step}</span>
                                            </div>
                                            {i < steps.length - 1 && <div className={`admin-order-step-line ${i < stepIndex ? 'done' : ''}`} />}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Customer Info + Shipping Address cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-panel p-6 rounded-2xl border border-gold/10 !mb-0">
                                        <h3 className="admin-section-title text-gold mb-4">Customer Info</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <User size={18} className="text-gold shrink-0" />
                                                <span>Name</span>
                                                <span className="text-white font-medium ml-auto">{selectedOrder.firstName} {selectedOrder.lastName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Mail size={18} className="text-gold shrink-0" />
                                                <span>Email</span>
                                                <span className="text-white font-medium ml-auto truncate max-w-[180px]">{selectedOrder.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Phone size={18} className="text-gold shrink-0" />
                                                <span>Phone</span>
                                                <span className="text-white font-medium ml-auto">{selectedOrder.phone || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="glass-panel p-6 rounded-2xl border border-gold/10 !mb-0">
                                        <h3 className="admin-section-title text-gold mb-4">Shipping Address</h3>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                <MapPin size={24} className="text-gold" />
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                <p className="text-white font-medium">{selectedOrder.address}</p>
                                                <p>{selectedOrder.city}, {selectedOrder.zip}</p>
                                                <p>Delivery method: Delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Itemized Order Summary */}
                                <div className="glass-panel p-6 rounded-2xl border border-gold/10 !mb-0">
                                    <h3 className="admin-section-title text-gold mb-4">Itemized Order Summary</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.cart?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 flex items-center justify-center text-gray-600">
                                                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xs">X</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-gold">Gold Price</p>
                                                </div>
                                                <p className="text-gold font-semibold">{formatOrderPrice(item.price * (item.quantity || 1), selectedOrder)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5 text-right space-y-2">
                                        <div className="flex justify-end gap-8 text-sm">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="text-gold">{formatOrderPrice(selectedOrder.total, selectedOrder)}</span>
                                        </div>
                                        <div className="flex justify-end gap-8 text-sm">
                                            <span className="text-gray-400">Tax</span>
                                            <span className="text-gold">{formatOrderPrice(0, selectedOrder)}</span>
                                        </div>
                                        <div className="flex justify-end gap-8 text-lg font-heading pt-2">
                                            <span className="text-white">Total</span>
                                            <span className="text-gold font-bold">{formatOrderPrice(selectedOrder.total, selectedOrder)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fulfillment quick actions */}
                                <div id="fulfillment-actions" className="flex flex-wrap gap-3 scroll-mt-8 pb-4">
                                    {['New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Reviews', 'Cancelled', 'Refunded'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedOrder.fulfillmentStatus === status ? 'bg-gold text-black shadow-[0_0_15px_rgba(197,168,114,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                    <input
                                        type="text"
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="Tracking number..."
                                        className="admin-input flex-1 min-w-[120px] py-2 text-sm"
                                    />
                                    <button onClick={handleSaveTracking} disabled={!trackingInput.trim()} className="btn-premium btn-premium-gold py-2 px-4 text-sm disabled:opacity-30">
                                        Mark Shipped
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {/* Modal - Simulated Print/Delete */}
            {deleteConfirm.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content p-8 text-center animate-reveal">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-heading text-white mb-2">Confirm Removal</h3>
                        <p className="text-gray-500 text-sm mb-8">Are you sure you want to delete order #{deleteConfirm.id?.slice(0, 8)}? This workflow cannot be reversed.</p>
                        <div className="flex gap-4">
                            <button className="flex-1 btn-premium btn-premium-outline" onClick={() => setDeleteConfirm({ show: false, id: null })}>Dismiss</button>
                            <button className="flex-1 btn-premium bg-red-600 text-white hover:bg-red-500" onClick={() => alert("Action restricted in demo mode")}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Orders;
