import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

        return { totalRevenue, uniqueCustomers, salesData };
    }, [orders]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Dashboard...</p>
        </div>
    );

    const Card = ({ title, value, icon: Icon, trend, trendUp }) => (
        <div className="admin-card p-8 group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="admin-subtitle mb-2">{title}</p>
                    <h3 className="text-3xl md:text-4xl font-heading text-white tracking-tight">{value}</h3>
                </div>
                <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </span>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">vs last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header Area */}
            <div className="admin-header flex-row items-end justify-between">
                <div>
                    <h1 className="admin-title">Performance <span className="highlight">Overview</span></h1>
                    <p className="admin-subtitle opacity-70 mt-2">Real-time marketplace analytics and digital insights</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-ghost">Export Data</button>
                    <button className="btn-gold">Manage System</button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Net Revenue" value={`$${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon={DollarSign} trend="12.5%" trendUp={true} />
                <Card title="Sales Volume" value={orders.length} icon={ShoppingBag} trend="8.2%" trendUp={true} />
                <Card title="Active Clients" value={analytics.uniqueCustomers} icon={Users} trend="2.4%" trendUp={true} />
                <Card title="Conversion Rate" value="3.1%" icon={Activity} trend="0.5%" trendUp={false} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 admin-card min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-heading text-white">Revenue Trajectory</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-2 opacity-60">Financial Performance Timeline</p>
                        </div>
                        <div className="p-1 bg-white/5 rounded-xl border border-white/5 flex">
                            <button className="px-6 py-2 rounded-lg text-[10px] font-bold uppercase bg-gold text-black transition-all shadow-lg">Weekly</button>
                            <button className="px-6 py-2 rounded-lg text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-all">Monthly</button>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        {analytics.salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={v => `$${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '12px' }}
                                        labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 0, fill: '#D4AF37' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-700 opacity-50 gap-4">
                                <Activity size={48} strokeWidth={1} />
                                <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Awaiting Transactional Feed...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Recent Transactions */}
                <div className="admin-card flex flex-col h-full bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-heading text-white">Live Ledger</h3>
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1 opacity-60">Recent Activity</p>
                        </div>
                        <Link to="/admin/orders" className="text-gold text-[9px] font-bold uppercase tracking-[0.2em] hover:text-white transition-all border-b border-gold/30 hover:border-white pb-0.5">View All</Link>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-3">
                        {orders.slice().reverse().slice(0, 8).map(order => (
                            <div key={order.id} className="group p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-gold/20 transition-all duration-300 cursor-default">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold font-bold text-xs border border-gold/10 group-hover:bg-gold group-hover:text-black transition-all duration-500 shadow-lg">
                                            {order.user?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-gold transition-colors">{order.firstName} {order.lastName}</p>
                                            <p className="text-[9px] text-gray-600 font-mono tracking-tight mt-0.5 uppercase">ID: {order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white">${Number(order.total).toFixed(2)}</p>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5 font-bold opacity-60">{order.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center py-20 opacity-30">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500">No records found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
