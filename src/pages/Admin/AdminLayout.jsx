import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Package, LogOut, Mail, Users, BarChart3, Settings, Headphones, Bell, Search, Menu } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const LaurelLogo = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold shrink-0" aria-hidden>
        <path d="M12 2L14 8L20 9L15 13L17 19L12 16L7 19L9 13L4 9L10 8L12 2Z" fill="currentColor" opacity={0.9} />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
);

const AdminLayout = () => {
    const navigate = useNavigate();
    const { currentUser, isAdmin, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    React.useEffect(() => {
        if (!loading && (!currentUser || !isAdmin)) {
            navigate('/admin/login');
        }
    }, [currentUser, isAdmin, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );

    if (!currentUser || !isAdmin) return null;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        { path: '/admin', label: 'Overview', icon: Home, end: true },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/messages', label: 'Messages', icon: Mail },
    ];
    const footerNav = [
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
    const displayLabel = displayName.replace(/\s+/g, ' ') + ' - Pro User';

    return (
        <div className="admin-theme min-h-screen flex bg-[#030303]">
            {/* Sidebar - vertical nav per wireframe */}
            <aside className={`admin-sidebar w-64 border-r border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl flex flex-col fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 flex items-center gap-3">
                    <LaurelLogo />
                    <Link to="/admin" className="text-xl font-heading text-gold tracking-tight">Ambrosia Admin</Link>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ path, label, icon: Icon, end }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={!!end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive ? 'bg-gold text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                            }
                        >
                            <Icon size={20} className="shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                    {footerNav.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive ? 'bg-gold text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                            }
                        >
                            <Icon size={20} className="shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-0.5">
                    <a href="#support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <Headphones size={20} />
                        Support
                    </a>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay when sidebar open on mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
            )}

            {/* Main content + top horizontal navbar */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
                {/* Top horizontal navbar - clean bar per wireframe */}
                <header className="admin-topbar h-16 bg-[#030303]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 px-4 md:px-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-1 text-gray-400 hover:text-white rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Desktop Horizontal Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map(({ path, label, icon: Icon, end }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={!!end}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'text-gold' : 'text-gray-500 hover:text-white'}`
                                }
                            >
                                <Icon size={16} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex-1 flex justify-center md:justify-start max-w-xl">
                        <div className="admin-search-wrap relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Q Search..."
                                className="admin-input w-full pl-11 pr-4 py-2.5 text-sm bg-white/[0.04] border border-gold/20 rounded-xl placeholder:text-gray-500 focus:border-gold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden sm:flex items-center gap-3 text-right">
                            <span className="text-sm font-medium text-white truncate max-w-[140px]">{displayLabel}</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gold transition-colors relative rounded-lg" aria-label="Notifications">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full ring-2 ring-[#030303]" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gold transition-colors rounded-lg" aria-label="Settings">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                {/* Mobile bottom nav - horizontal tabs */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-2 safe-area-pb">
                    <NavLink to="/admin" end className={({ isActive }) => `admin-mobile-tab ${isActive ? 'active text-gold' : ''}`}><Home size={20} /><span>Overview</span></NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `admin-mobile-tab ${isActive ? 'active text-gold' : ''}`}><Package size={20} /><span>Products</span></NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `admin-mobile-tab ${isActive ? 'active text-gold' : ''}`}><ShoppingBag size={20} /><span>Orders</span></NavLink>
                    <NavLink to="/admin/customers" className={({ isActive }) => `admin-mobile-tab ${isActive ? 'active text-gold' : ''}`}><Users size={20} /><span>Customers</span></NavLink>
                    <NavLink to="/admin/messages" className={({ isActive }) => `admin-mobile-tab ${isActive ? 'active text-gold' : ''}`}><Mail size={20} /><span>Messages</span></NavLink>
                </nav>

                <main className="admin-main flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
