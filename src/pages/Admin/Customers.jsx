import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './Admin.css';

const TABS = ['All', 'Clients', 'Subscribers', 'Both'];

const Customers = () => {
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const qOrders = query(collection(db, "orders"), orderBy("created_at", "desc"));
        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

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
            if (filterType === 'Clients') matchesFilter = c.isCustomer;
            if (filterType === 'Subscribers') matchesFilter = c.isSubscriber;
            if (filterType === 'Both') matchesFilter = c.isCustomer && c.isSubscriber;

            return matchesSearch && matchesFilter;
        });
    }, [unifiedCustomers, searchTerm, filterType]);

    const paginatedCustomers = filteredCustomers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));

    return (
        <div>
            <div className="border-b-2 border-[#1c1a17] px-7 h-12 flex items-center justify-between gap-4">
                <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar">
                    {TABS.map(t => (
                        <button key={t} type="button" onClick={() => setFilterType(t)} className={`admin-pill ${filterType === t ? 'active' : ''}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 h-[34px] px-3 border border-[#1c1a17] bg-[#0a0a0a] w-56 shrink-0">
                    <Search size={13} className="text-[#615c54] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-none text-[#f2efe9] text-xs outline-none placeholder:text-[#615c54]"
                    />
                </div>
            </div>

            <table className="admin-table w-full">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th className="text-right">Orders</th>
                        <th className="text-right">Lifetime value</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="py-8 text-center text-[#615c54]">Loading…</td></tr>
                    ) : paginatedCustomers.length === 0 ? (
                        <tr><td colSpan={6} className="py-24 text-center text-[#615c54]">No matching records found.</td></tr>
                    ) : (
                        paginatedCustomers.map(c => (
                            <tr key={c.email}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 bg-gold/[0.14] text-gold text-[11px] font-bold flex items-center justify-center shrink-0">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-[#f2efe9]">{c.name}</span>
                                    </div>
                                </td>
                                <td className="text-[#c9c4bb]">{c.email}</td>
                                <td className="font-mono text-[11px] text-[#8a857e]">{c.phone}</td>
                                <td>
                                    <span className="status-pill new-status">{c.isCustomer && c.isSubscriber ? 'Both' : c.isCustomer ? 'Client' : 'Subscriber'}</span>
                                </td>
                                <td className="text-right font-mono">{c.orderCount}</td>
                                <td className="text-right font-mono font-semibold text-gold">{formatPrice(c.totalSpent)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="px-7 py-4 flex items-center justify-between">
                <span className="text-[11px] text-[#615c54]">
                    Showing {filteredCustomers.length === 0 ? 0 : currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
                <div className="flex border border-[#1c1a17]">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="w-[30px] h-7 flex items-center justify-center border-r border-[#1c1a17] text-[#8a857e] disabled:opacity-30 hover:text-gold transition-colors"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="w-[30px] h-7 flex items-center justify-center text-[#8a857e] disabled:opacity-30 hover:text-gold transition-colors"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Customers;
