import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import './Admin.css';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("created_at", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dateObj: doc.data().created_at?.toDate(),
                date: doc.data().created_at?.toDate().toLocaleDateString() || 'N/A'
            }));
            // Sort for chart (oldest to newest)
            ordersData.sort((a, b) => (a.dateObj || 0) - (b.dateObj || 0));
            setOrders(ordersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const analytics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.user)).size;
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Group by date for chart
        const salesByDate = {};
        orders.forEach(o => {
            if (!salesByDate[o.date]) salesByDate[o.date] = 0;
            salesByDate[o.date] += Number(o.total);
        });

        const salesData = Object.entries(salesByDate).map(([date, sales]) => ({
            date,
            sales
        }));

        return { totalRevenue, uniqueCustomers, averageOrderValue, salesData };
    }, [orders]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Command Center...</p>
        </div>
    );

    const MetricCard = ({ label, value, subtext, trend }) => (
        <div className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={100} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-4">{label}</p>
            <h3 className="text-5xl font-heading text-white mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left duration-500">
                {value}
            </h3>
            <div className="flex items-center gap-4">
                <p className="text-xs font-mono text-gold opacity-80">{subtext}</p>
                {trend && (
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                        <ArrowUpRight size={10} /> {trend}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-16 animate-fade-in pb-20">
            {/* Editorial Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div>
                    <h1 className="text-6xl md:text-7xl font-heading text-white tracking-tighter mb-4">
                        Overview
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-gold/50"></div>
                        <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Executive Summary</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn-ghost">Download Report</button>
                    <button className="btn-gold">System Status</button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Total Revenue"
                    value={`$${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    subtext="Gross Income"
                    trend="12.5%"
                />
                <MetricCard
                    label="Active Clients"
                    value={analytics.uniqueCustomers}
                    subtext="Unique Wallets"
                    trend="4.2%"
                />
                <MetricCard
                    label="Avg. Order Value"
                    value={`$${analytics.averageOrderValue.toFixed(0)}`}
                    subtext="Per Transaction"
                    trend="1.8%"
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="xl:col-span-2 p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-3xl font-heading text-white">Performance</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-2">Revenue Velocity</p>
                        </div>
                        <select className="bg-transparent text-white text-xs uppercase tracking-widest border-none outline-none cursor-pointer hover:text-gold transition-colors">
                            <option className="bg-black">This Month</option>
                            <option className="bg-black">Last Month</option>
                            <option className="bg-black">YTD</option>
                        </select>
                    </div>

                    <div className="h-[400px] w-full">
                        {analytics.salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
                                        dy={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={v => `$${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}
                                        itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#D4AF37"
                                        strokeWidth={2}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-20">
                                <p className="text-[10px] uppercase tracking-widest">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Feed */}
                <div className="rounded-[2.5rem] bg-white/[0.01] border border-white/5 p-8 flex flex-col">
                    <h3 className="text-2xl font-heading text-white mb-8">Recent Activity</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar max-h-[400px] pr-2">
                        {orders.slice().reverse().slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] p-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-heading text-gray-400 group-hover:border-gold/50 group-hover:text-gold transition-colors">
                                        {order.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-body">{order.firstName} {order.lastName}</p>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">{order.date}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gold">${Number(order.total).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/admin/orders" className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 hover:text-white transition-colors">
                        View All Transcations
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
