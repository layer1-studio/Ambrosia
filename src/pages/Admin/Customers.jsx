import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Search, Mail, User, Users, Phone, Filter, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import './Admin.css';

const Customers = () => {
    const [orders, setOrders] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Customer, Subscriber, Both
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        // Real-time listener for orders
        const qOrders = query(collection(db, "orders"), orderBy("created_at", "desc"));
        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Real-time listener for subscribers
        const qSubscribers = query(collection(db, "subscribers"), orderBy("date", "desc"));
        const unsubscribeSubscribers = onSnapshot(qSubscribers, (snapshot) => {
            setSubscribers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeSubscribers();
        };
    }, []);

    const unifiedCustomers = useMemo(() => {
        const customerMap = new Map();

        // Process orders
        orders.forEach(order => {
            const email = (order.email || order.user || '').toLowerCase().trim();
            if (!email) return;

            if (!customerMap.has(email)) {
                customerMap.set(email, {
                    email,
                    name: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Anonymous',
                    phone: order.phone || '—',
                    isCustomer: true,
                    isSubscriber: false,
                    lastOrder: order.created_at?.toDate() || new Date(),
                    orderCount: 1,
                    totalSpent: Number(order.total) || 0
                });
            } else {
                const existing = customerMap.get(email);
                existing.isCustomer = true;
                existing.orderCount += 1;
                existing.totalSpent += (Number(order.total) || 0);
                if (order.firstName && existing.name === 'Anonymous') {
                    existing.name = `${order.firstName} ${order.lastName || ''}`.trim();
                }
                if (order.phone && existing.phone === '—') {
                    existing.phone = order.phone;
                }
            }
        });

        // Process subscribers
        subscribers.forEach(sub => {
            const email = (sub.email || '').toLowerCase().trim();
            if (!email) return;

            if (!customerMap.has(email)) {
                customerMap.set(email, {
                    email,
                    name: 'Subscriber',
                    phone: '—',
                    isCustomer: false,
                    isSubscriber: true,
                    dateJoined: sub.date ? new Date(sub.date) : new Date(),
                    orderCount: 0,
                    totalSpent: 0
                });
            } else {
                const existing = customerMap.get(email);
                existing.isSubscriber = true;
            }
        });

        return Array.from(customerMap.values()).sort((a, b) => {
            const dateA = a.lastOrder || a.dateJoined || new Date(0);
            const dateB = b.lastOrder || b.dateJoined || new Date(0);
            return dateB - dateA;
        });
    }, [orders, subscribers]);

    const filteredCustomers = useMemo(() => {
        return unifiedCustomers.filter(c => {
            const matchesSearch = c.email.includes(searchTerm.toLowerCase()) ||
                c.name.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            if (filterType === 'Customer') matchesFilter = c.isCustomer;
            if (filterType === 'Subscriber') matchesFilter = c.isSubscriber;
            if (filterType === 'Both') matchesFilter = c.isCustomer && c.isSubscriber;

            return matchesSearch && matchesFilter;
        });
    }, [unifiedCustomers, searchTerm, filterType]);

    const paginatedCustomers = filteredCustomers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);

    return (
        <div className="space-y-6 animate-reveal">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="admin-section-title admin-title text-2xl md:text-3xl font-heading text-gold mb-1">Customer Registry</h1>
                    <p className="text-gray-500 text-sm">Unified database of clients and subscribers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-panel px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                        <Users size={16} className="text-gold" />
                        <span className="text-sm font-bold text-white">{unifiedCustomers.length}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input w-full pl-11 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:border-gold/50"
                        />
                    </div>
                    <div className="relative w-56 shrink-0">
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gold pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="admin-input w-full pl-20 pr-10 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl appearance-none cursor-pointer focus:border-gold/50 text-sm"
                        >
                            {['All', 'Customer', 'Subscriber', 'Both'].map(t => (
                                <option key={t} value={t} className="bg-[#0a0a0a] text-white">{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="admin-table-wrapper glass-panel rounded-2xl border border-white/5">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Identity</th>
                            <th>Contact Channels</th>
                            <th>Status & Source</th>
                            <th className="text-right">Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={4} className="py-8 animate-pulse bg-white/5"></td></tr>
                            ))
                        ) : paginatedCustomers.length === 0 ? (
                            <tr><td colSpan={4} className="py-24 text-center text-gray-500">No matching records found.</td></tr>
                        ) : (
                            paginatedCustomers.map((c, i) => (
                                <tr key={c.email} className="group">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{c.name}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {c.isCustomer && <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Client</span>}
                                                    {c.isSubscriber && <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Sub</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Mail size={12} className="text-gold/50" />
                                                {c.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Phone size={12} className="text-gold/50" />
                                                {c.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-bold ${c.isCustomer ? 'text-green-400' : 'text-gray-500'}`}>
                                                {c.isCustomer ? 'Purchased' : 'Lead Only'}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {c.orderCount > 0 ? `${c.orderCount} Orders` : 'Newsletter List'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <p className="text-sm font-bold text-gold">${c.totalSpent.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter italic">Lifetime Value</p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pb-8">
                <span className="text-xs text-gray-500">
                    Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filteredCustomers.length)} of {filteredCustomers.length} records
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-2 rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:text-gold transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="p-2 rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:text-gold transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Customers;
