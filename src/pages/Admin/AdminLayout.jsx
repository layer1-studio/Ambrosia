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
        <div className="admin-theme min-h-screen bg-[#030303]">
            {/* Main top horizontal navbar */}
            <header className="h-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Brand Label */}
                    <div className="flex items-center gap-3">
                        <LaurelLogo />
                        <span className="text-sm font-bold tracking-[0.3em] uppercase text-gold whitespace-nowrap">Ambrosia Admin</span>
                    </div>

                    {/* Navigation Divider */}
                    <div className="h-8 w-px bg-white/10 hidden lg:block" />

                    {/* Main Nav Links */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.map(({ path, label, icon: Icon, end }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={!!end}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all group ${isActive ? 'text-gold' : 'text-gray-500 hover:text-white'}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={18} className={isActive ? 'text-gold' : 'group-hover:scale-110 transition-transform'} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu Indicator (Optional/Compact) */}
                <div className="lg:hidden flex items-center gap-4">
                    <nav className="flex items-center gap-2">
                        {navItems.slice(0, 3).map(({ path, icon: Icon }) => (
                            <NavLink key={path} to={path} className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-gold' : 'text-gray-500'}`}>
                                <Icon size={20} />
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Side Tools */}
                <div className="flex items-center gap-3">
                    {/* Analytics Quick Link */}
                    <NavLink
                        to="/admin/analytics"
                        className={({ isActive }) => `p-2.5 rounded-xl border border-white/5 hover:border-gold/30 transition-all ${isActive ? 'bg-gold/10 text-gold border-gold/20' : 'text-gray-400'}`}
                        title="Analytics"
                    >
                        <BarChart3 size={20} />
                    </NavLink>

                    {/* Settings Quick Link */}
                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) => `p-2.5 rounded-xl border border-white/5 hover:border-gold/30 transition-all ${isActive ? 'bg-gold/10 text-gold border-gold/20' : 'text-gray-400'}`}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </NavLink>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* User Profile / Logout */}
                    <div className="flex items-center gap-3 pl-2">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{displayName}</p>
                            <p className="text-[9px] text-gold/60 font-medium uppercase mt-1">Administrator</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-sm hover:bg-gold/20 transition-all relative group"
                        >
                            {displayName.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />

                            {/* Logout tooltip on hover */}
                            <LogOut size={12} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity bg-gold rounded text-black p-0.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content area */}
            <main className="admin-main p-6 md:p-10">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
