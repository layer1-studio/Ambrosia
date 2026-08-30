import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Search, X, Trash2 } from 'lucide-react';
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
            const order = orders.find(o => o.id === orderId);
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
            await sendStatusEmail(selectedOrder, 'Shipped', trackingInput);
            setTrackingInput('');
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
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #5b0e22; padding-bottom: 20px; margin-bottom: 30px; align-items: center; }
                        .logo { color: #5b0e22; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; }
                        .invoice-info { text-align: right; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 40px; }
                        .section-title { color: #5b0e22; text-transform: uppercase; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding: 15px; border-bottom: 2px solid #f0f0f0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
                        td { padding: 15px; border-bottom: 1px solid #f8f8f8; font-size: 14px; }
                        .total-row { text-align: right; font-size: 20px; font-weight: bold; margin-top: 30px; border-top: 2px solid #5b0e22; padding-top: 15px; }
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
                            <p style="margin: 10px 0 0; color: #5b0e22; font-size: 12px; font-weight: bold;">METHOD: Standard Delivery</p>
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
                        Authentic Ceylon Cinnamon &bull; Curated by Divine Essence
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const getStatusPill = (status) => {
        const s = status.toLowerCase();
        if (s === 'delivered' || s === 'completed') return 'success';
        if (s === 'pending' || s === 'processing') return 'warning';
        if (s === 'shipped') return 'info';
        if (s === 'new') return 'new-status';
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

    const statusTabs = ['All', 'New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Reviews', 'Cancelled'];
    const counts = { All: orders.length };
    statusTabs.slice(1).forEach(s => { counts[s] = orders.filter(o => o.fulfillmentStatus === s).length; });

    const steps = ['New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Reviews'];
    const statusToStep = { New: 0, Pending: 1, Processing: 2, Shipped: 3, Delivered: 4, Reviews: 5 };
    const stepIndex = selectedOrder ? (statusToStep[selectedOrder.fulfillmentStatus] ?? 1) : 0;

    return (
        <>
            {/* Status tabs + search */}
            <div className="border-b-2 border-[#1c1a17] px-7 h-12 flex items-center justify-between gap-4">
                <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar">
                    {statusTabs.map(t => (
                        <button key={t} type="button" onClick={() => setFilter(t)} className={`admin-pill ${filter === t ? 'active' : ''}`}>
                            {t}
                            <span className="pill-count">{counts[t]}</span>
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 h-[34px] px-3 border border-[#1c1a17] bg-[#0a0a0a] w-56 shrink-0">
                    <Search size={13} className="text-[#615c54] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-none text-[#f2efe9] text-xs outline-none placeholder:text-[#615c54]"
                    />
                </div>
            </div>

            {/* Table + detail panel */}
            <div className="grid" style={{ gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', minHeight: 'calc(100vh - 176px)' }}>
                <div className="min-w-0" style={{ borderRight: selectedOrder ? '2px solid #1c1a17' : 'none' }}>
                    <table className="admin-table w-full">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th className="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-gold/20 border-t-gold animate-spin" />
                                            <span className="text-sm text-[#615c54]">Syncing with database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center text-[#615c54] font-medium">
                                        No matching orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className="cursor-pointer"
                                        style={{ background: order.id === selectedOrderId ? 'rgba(217, 214, 186,.06)' : 'transparent' }}
                                    >
                                        <td className="font-mono text-[11.5px] text-gold">ORD-{order.id.slice(0, 5).toUpperCase()}</td>
                                        <td>{order.firstName} {order.lastName}</td>
                                        <td className="text-[#8a857e]">{order.dateFormatted}</td>
                                        <td>
                                            <span className={`status-pill ${order.paymentStatus === 'Paid' ? 'new-status' : 'danger'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${getStatusPill(order.fulfillmentStatus)}`}>
                                                {order.fulfillmentStatus}
                                            </span>
                                        </td>
                                        <td className="text-right font-mono font-semibold">{formatOrderPrice(order.total, order)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedOrder && (
                    <aside className="bg-[#0a0a0a] min-w-0 flex flex-col">
                        <div className="h-14 border-b-2 border-[#1c1a17] px-6 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="m-0 font-mono text-[13px] font-semibold text-[#f2efe9]">ORD-{selectedOrder.id.slice(0, 5).toUpperCase()}</p>
                                <p className="m-0 mt-0.5 text-[10px] tracking-[0.12em] uppercase text-[#615c54]">{selectedOrder.dateFormatted}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedOrderId(null)} className="w-7 h-7 border border-[#1c1a17] text-[#8a857e] hover:text-white hover:border-[#3a352d] transition-colors flex items-center justify-center shrink-0">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="px-6 py-5 border-b border-[#141311]">
                                <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Progress</span>
                                <div className="admin-order-steps mt-3.5">
                                    {steps.map((step, i) => (
                                        <div key={step} className={`admin-order-step ${i <= stepIndex ? (i < stepIndex ? 'done' : 'active') : ''}`}>
                                            <div className="admin-order-step-dot" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 py-5 border-b border-[#141311]">
                                <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Customer</span>
                                <p className="m-0 mt-3 text-sm font-semibold text-[#f2efe9]">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                                <div className="mt-2.5 flex flex-col gap-1.5">
                                    <div className="flex justify-between gap-3"><span className="text-[11px] text-[#615c54]">Email</span><span className="text-[11px] text-[#c9c4bb] truncate">{selectedOrder.email}</span></div>
                                    <div className="flex justify-between gap-3"><span className="text-[11px] text-[#615c54]">Phone</span><span className="font-mono text-[11px] text-[#c9c4bb]">{selectedOrder.phone || '—'}</span></div>
                                    <div className="flex justify-between gap-3"><span className="text-[11px] text-[#615c54]">Ship to</span><span className="text-[11px] text-[#c9c4bb] text-right">{selectedOrder.address}, {selectedOrder.city}</span></div>
                                </div>
                            </div>

                            <div className="px-6 py-5 border-b border-[#141311]">
                                <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Items</span>
                                <div className="mt-3 flex flex-col">
                                    {selectedOrder.cart?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#141311] last:border-0">
                                            <div className="w-9 h-9 bg-black overflow-hidden shrink-0 grayscale flex items-center justify-center text-[#4a463f]">
                                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xs">×</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="m-0 text-xs text-[#f2efe9] truncate">{item.name}</p>
                                                <p className="m-0 mt-0.5 font-mono text-[10px] text-[#615c54]">× {item.quantity || 1}</p>
                                            </div>
                                            <span className="font-mono text-xs text-[#f2efe9]">{formatOrderPrice(item.price * (item.quantity || 1), selectedOrder)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3.5 flex justify-between items-baseline pt-3 border-t-2 border-[#1c1a17]">
                                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a857e]">Total</span>
                                    <span className="font-mono text-lg font-semibold text-gold">{formatOrderPrice(selectedOrder.total, selectedOrder)}</span>
                                </div>
                            </div>

                            <div className="px-6 py-5">
                                <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Set status</span>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {['New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Reviews', 'Cancelled', 'Refunded'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                                            className={`h-[26px] px-2.5 text-[9px] font-bold uppercase tracking-[0.1em] border transition-colors ${selectedOrder.fulfillmentStatus === status ? 'bg-gold border-gold text-black' : 'border-[#1c1a17] text-[#8a857e] hover:border-[#3a352d]'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 flex">
                                    <input
                                        type="text"
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="Tracking number"
                                        className="flex-1 min-w-0 h-[34px] px-3 bg-[#050505] border border-[#1c1a17] text-[#f2efe9] font-mono text-xs outline-none focus:border-gold/50"
                                    />
                                    <button onClick={handleSaveTracking} disabled={!trackingInput.trim()} className="h-[34px] px-4 bg-gold border-none text-black text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-30 hover:bg-[#c2bfa0] transition-colors whitespace-nowrap">
                                        Ship
                                    </button>
                                </div>
                                <button onClick={handlePrint} className="mt-2 w-full h-[34px] bg-transparent border border-[#3a352d] text-[#f2efe9] text-[10px] font-bold uppercase tracking-[0.14em] text-left px-3.5 hover:border-gold hover:text-gold transition-colors">
                                    Print invoice
                                </button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Delete confirmation */}
            {deleteConfirm.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content p-7 text-center">
                        <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center mx-auto mb-5 text-red-500">
                            <Trash2 size={22} />
                        </div>
                        <h3 className="text-lg font-semibold text-[#f2efe9] mb-2">Delete order #{deleteConfirm.id?.slice(0, 8)}?</h3>
                        <p className="text-[#8a857e] text-sm mb-7">This can't be undone.</p>
                        <div className="flex gap-3">
                            <button className="flex-1 btn-premium btn-premium-outline justify-center" onClick={() => setDeleteConfirm({ show: false, id: null })}>Cancel</button>
                            <button className="flex-1 btn-premium bg-red-600 text-white justify-center" onClick={() => alert("Action restricted in demo mode")}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Orders;
