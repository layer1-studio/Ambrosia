import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Tag, TrendingUp, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './Admin.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MetricCard = ({ label, value, icon: Icon, trend, last }) => (
    <div className={`p-6 md:p-7 ${last ? '' : 'border-r-2 border-[#1c1a17]'}`}>
        <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a857e]">{label}</span>
            <Icon size={16} className="text-[#4a463f]" />
        </div>
        <p className="m-0 text-[28px] md:text-[34px] font-semibold tracking-tight text-[#f2efe9] leading-none font-mono">{value}</p>
        <div className="mt-3.5 flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-gold">+{trend}%</span>
            <span className="text-[10px] text-[#615c54] uppercase tracking-wide">vs last month</span>
        </div>
        <div className="mt-4 flex items-end gap-[3px] h-[26px]">
            {[3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15].map((h, i, arr) => (
                <div key={i} className="flex-1" style={{ height: `${(h / 15) * 26}px`, background: i === arr.length - 1 ? '#d9d6ba' : 'rgba(217, 214, 186,.26)' }} />
            ))}
        </div>
    </div>
);

const Dashboard = () => {
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentPage, setRecentPage] = useState(0);
    const recentPageSize = 5;

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("created_at", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dateObj: doc.data().created_at?.toDate(),
                date: doc.data().created_at?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || 'N/A',
                dateFull: doc.data().created_at?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A',
                status: doc.data().status || 'Pending',
            }));
            ordersData.sort((a, b) => (a.dateObj || 0) - (b.dateObj || 0));
            setOrders(ordersData);
            setLoading(false);
        });

        const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribe();
            unsubProducts();
        };
    }, []);

    const analytics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
        const totalOrders = orders.length;
        const uniqueCustomers = new Set(orders.map(o => o.user || o.email)).size;
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        const revenueByMonth = MONTHS.map((m, i) => {
            const monthOrders = orders.filter(o => {
                const d = o.dateObj;
                if (!d) return false;
                return d.getMonth() === i;
            });
            const current = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
            return { month: m, currentYear: current, x: i };
        });

        // Calculate Linear Trendline (y = mx + b)
        const n = revenueByMonth.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        revenueByMonth.forEach(d => {
            sumX += d.x;
            sumY += d.currentYear;
            sumXY += d.x * d.currentYear;
            sumX2 += d.x * d.x;
        });

        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        const finalData = revenueByMonth.map(d => ({
            ...d,
            trend: Math.max(0, m * d.x + b)
        }));

        const lowStockProducts = products.filter(p => (Number(p.stock) || 0) <= (Number(p.reorderPoint) || 10));

        return { totalRevenue, totalOrders, uniqueCustomers, averageOrderValue, revenueByMonth: finalData, lowStockProducts };
    }, [orders, products]);

    const recentOrders = useMemo(() => [...orders].reverse(), [orders]);
    const paginatedRecent = recentOrders.slice(recentPage * recentPageSize, (recentPage + 1) * recentPageSize);
    const totalRecentPages = Math.max(1, Math.ceil(recentOrders.length / recentPageSize));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold animate-spin mb-4" />
            <p className="text-[#615c54] text-sm">Preparing your insights...</p>
        </div>
    );

    const getStatusPill = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'delivered' || s === 'completed') return 'status-pill success';
        if (s === 'shipped') return 'status-pill info';
        if (s === 'pending' || s === 'processing') return 'status-pill warning';
        if (s === 'new') return 'status-pill new-status';
        if (s === 'reviews') return 'status-pill reviews-status';
        if (s === 'cancelled' || s === 'refunded') return 'status-pill danger';
        return 'status-pill default';
    };

    return (
        <div>
            {/* Low stock alert — thin severity strip, not a big red block */}
            {analytics.lowStockProducts.length > 0 && (
                <div className="border-b-2 border-[#1c1a17] bg-[#0a0807] flex items-stretch">
                    <div className="w-1 bg-red-500 shrink-0" />
                    <div className="flex-1 min-w-0 px-7 py-3.5 flex items-center gap-7 overflow-x-auto">
                        <div className="flex items-center gap-2.5 shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-red-500">Low stock</span>
                        </div>
                        <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                            {analytics.lowStockProducts.map(p => (
                                <div key={p.id} className="pr-7 mr-7 border-r border-[#1c1a17] flex items-baseline gap-2 whitespace-nowrap">
                                    <span className="text-xs text-[#f2efe9] font-medium">{p.name}</span>
                                    <span className="font-mono text-[11px] text-red-500">{p.stock}/{p.reorderPoint || 10}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/secured-web-ambrosia/admin/products" className="shrink-0 h-[30px] px-3.5 flex items-center border border-[#3a352d] text-[#f2efe9] text-[10px] font-bold uppercase tracking-[0.14em] hover:border-gold hover:text-gold transition-colors">Restock</Link>
                    </div>
                </div>
            )}

            {/* KPI cells */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-[#1c1a17]">
                <MetricCard label="Total revenue" value={formatPrice(analytics.totalRevenue)} icon={DollarSign} trend="15" />
                <MetricCard label="Orders" value={analytics.totalOrders.toLocaleString()} icon={ShoppingBag} trend="8" />
                <MetricCard label="Customers" value={analytics.uniqueCustomers.toLocaleString()} icon={Users} trend="20" />
                <MetricCard label="Avg order value" value={formatPrice(analytics.averageOrderValue)} icon={Tag} trend="5" last />
            </div>

            {/* Revenue chart */}
            <section className="p-6 md:p-7 border-b-2 border-[#1c1a17]">
                <h2 className="admin-section-title text-[#f2efe9] mb-5">Revenue</h2>
                <div style={{ height: 280, width: '100%', minWidth: 0 }}>
                    {analytics.revenueByMonth.some(d => d.currentYear > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d9d6ba" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#d9d6ba" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" stroke="#141311" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#615c54', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#615c54', fontSize: 10 }} tickFormatter={v => formatPrice(v)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1c1a17', borderRadius: 0, padding: '10px 14px' }}
                                    labelStyle={{ color: '#f2efe9', fontSize: 11, fontWeight: 600, marginBottom: 4 }}
                                    itemStyle={{ fontSize: 11 }}
                                    formatter={(value, name) => [formatPrice(value), name === 'trend' ? 'Trendline' : 'Actual Revenue']}
                                    labelFormatter={(l) => l}
                                />
                                <Area type="monotone" dataKey="currentYear" name="currentYear" stroke="#d9d6ba" strokeWidth={2} fill="url(#colorCurrent)" />
                                <Line type="monotone" dataKey="trend" name="trend" stroke="#f2efe9" strokeOpacity={0.4} strokeDasharray="4 4" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#615c54]">
                            <TrendingUp size={40} className="opacity-20 mb-3" />
                            <p className="text-sm">Revenue data will appear here</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent orders */}
            <section className="p-6 md:p-7">
                <div className="flex justify-between items-baseline mb-4">
                    <h2 className="admin-section-title text-[#f2efe9] mb-0">Recent orders</h2>
                    <Link to="/secured-web-ambrosia/admin/orders" className="text-[10px] font-bold text-gold uppercase tracking-[0.14em] hover:text-white transition-colors">All orders →</Link>
                </div>
                <table className="admin-table w-full">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecent.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-[#615c54] text-sm">No orders yet</td></tr>
                        ) : (
                            paginatedRecent.map(order => (
                                <tr
                                    key={order.id}
                                    className="cursor-pointer"
                                    onClick={() => navigate('/secured-web-ambrosia/admin/orders')}
                                >
                                    <td className="font-mono text-[11.5px] text-gold">#{order.id.slice(0, 8).toUpperCase()}</td>
                                    <td>{order.firstName} {order.lastName}</td>
                                    <td className="text-[#8a857e]">{order.dateFull}</td>
                                    <td><span className={getStatusPill(order.status)}>{order.status}</span></td>
                                    <td className="text-right font-mono font-semibold">{formatPrice(order.total)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="flex items-center justify-between pt-4 mt-1">
                    <span className="text-[11px] text-[#615c54]">Showing {recentPage * recentPageSize + 1}-{Math.min((recentPage + 1) * recentPageSize, recentOrders.length)} of {recentOrders.length} entries</span>
                    <div className="flex border border-[#1c1a17]">
                        <button type="button" onClick={() => setRecentPage(p => Math.max(0, p - 1))} disabled={recentPage === 0} className="w-[30px] h-7 flex items-center justify-center border-r border-[#1c1a17] text-[#8a857e] disabled:opacity-30 hover:text-gold transition-colors"><ChevronLeft size={14} /></button>
                        <button type="button" onClick={() => setRecentPage(p => Math.min(totalRecentPages - 1, p + 1))} disabled={recentPage >= totalRecentPages - 1} className="w-[30px] h-7 flex items-center justify-center text-[#8a857e] disabled:opacity-30 hover:text-gold transition-colors"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
