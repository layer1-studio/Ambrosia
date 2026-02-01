import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Tag, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import './Admin.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
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
        return () => unsubscribe();
    }, []);

    const analytics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
        const totalOrders = orders.length;
        const uniqueCustomers = new Set(orders.map(o => o.user || o.email)).size;
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        const salesByDate = {};
        orders.forEach(o => {
            if (!salesByDate[o.date]) salesByDate[o.date] = 0;
            salesByDate[o.date] += Number(o.total);
        });
        const salesData = Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));

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

        return { totalRevenue, totalOrders, uniqueCustomers, averageOrderValue, salesData, revenueByMonth: finalData };
    }, [orders]);

    const recentOrders = useMemo(() => [...orders].reverse(), [orders]);
    const paginatedRecent = recentOrders.slice(recentPage * recentPageSize, (recentPage + 1) * recentPageSize);
    const totalRecentPages = Math.max(1, Math.ceil(recentOrders.length / recentPageSize));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Preparing your insights...</p>
        </div>
    );

    const MetricCard = ({ label, value, icon: Icon, trend }) => (
        <div className="admin-stat-card glass-panel animate-reveal flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="p-3 rounded-xl bg-gold/10 text-gold">
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="text-xs font-semibold text-green-500">+{trend}% vs last month</span>
                )}
            </div>
            <p className="text-label mb-1">{label}</p>
            <p className="text-2xl md:text-3xl font-heading text-gold tracking-tight">{value}</p>
            <div className="mt-auto pt-4 h-8 flex items-end">
                <div className="w-full h-6 bg-gold/10 rounded overflow-hidden flex gap-0.5 items-end">
                    {[2, 4, 3, 5, 4, 6].map((h, i) => (
                        <div key={i} className="flex-1 bg-gold/50 rounded-t min-h-[4px]" style={{ height: `${h * 4}px` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    const getStatusPill = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'delivered' || s === 'completed') return 'status-pill success';
        if (s === 'shipped') return 'status-pill info';
        if (s === 'processing') return 'status-pill warning';
        return 'status-pill warning';
    };

    return (
        <div className="space-y-8 animate-reveal">
            {/* KPI Cards - wireframe style */}
            <div className="grid grid-cols-2 gap-6">
                <MetricCard
                    label="Total Revenue"
                    value={`$${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    icon={DollarSign}
                    trend="15"
                />
                <MetricCard
                    label="Total Orders"
                    value={analytics.totalOrders.toLocaleString()}
                    icon={ShoppingBag}
                    trend="8"
                />
                <MetricCard
                    label="Total Customers"
                    value={analytics.uniqueCustomers.toLocaleString()}
                    icon={Users}
                    trend="20"
                />
                <MetricCard
                    label="Avg Order Value"
                    value={`$${Math.round(analytics.averageOrderValue)}`}
                    icon={Tag}
                    trend="5"
                />
            </div>

            {/* Revenue Over Time - Full Width */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5">
                <h3 className="admin-section-title text-xl font-heading text-gold mb-6">Revenue Over Time</h3>
                <div className="chart-container" style={{ height: 320 }}>
                    {analytics.revenueByMonth.some(d => d.currentYear > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} tickFormatter={v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}m` : `$${v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px' }}
                                    formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'trend' ? 'Trendline' : 'Actual Revenue']}
                                    labelFormatter={(l) => l}
                                />
                                <Legend wrapperStyle={{ paddingTop: 12 }} iconType="line" formatter={(value) => <span className="text-gray-400 text-sm">{value === 'trend' ? 'Trendline' : 'Actual Revenue'}</span>} />
                                <Area type="monotone" dataKey="currentYear" name="currentYear" stroke="#D4AF37" strokeWidth={2} fill="url(#colorCurrent)" />
                                <Line type="monotone" dataKey="trend" name="trend" stroke="#D4AF37" strokeDasharray="5 5" strokeOpacity={0.6} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <TrendingUp size={48} className="opacity-20 mb-4" />
                            <p className="text-sm">Revenue data will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders - Full Width */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="admin-section-title text-xl font-heading text-gold mb-0">Recent Orders</h3>
                    <Link to="/secured-web-ambrosia/admin/orders" className="text-xs font-bold text-gold hover:text-white transition-colors">VIEW ALL</Link>
                </div>
                <div className="admin-table-wrapper rounded-xl overflow-hidden flex-1 min-h-0">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecent.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No orders yet</td></tr>
                            ) : (
                                paginatedRecent.map(order => (
                                    <tr key={order.id}>
                                        <td className="font-mono text-sm text-gold">#{order.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="text-white font-medium">{order.firstName} {order.lastName}</td>
                                        <td><span className={getStatusPill(order.status)}>{order.status}</span></td>
                                        <td className="text-gold font-medium">${Number(order.total).toFixed(2)}</td>
                                        <td className="text-gray-400 text-sm">{order.dateFull}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                    <span className="text-xs text-gray-500">Showing {recentPage * recentPageSize + 1}-{Math.min((recentPage + 1) * recentPageSize, recentOrders.length)} of {recentOrders.length} entries</span>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setRecentPage(p => Math.max(0, p - 1))} disabled={recentPage === 0} className="p-2 rounded-lg text-gray-400 hover:text-gold disabled:opacity-30 transition-colors"><ChevronLeft size={18} /></button>
                        <button type="button" onClick={() => setRecentPage(p => Math.min(totalRecentPages - 1, p + 1))} disabled={recentPage >= totalRecentPages - 1} className="p-2 rounded-lg text-gray-400 hover:text-gold disabled:opacity-30 transition-colors"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
