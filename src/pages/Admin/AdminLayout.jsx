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
        { path: '/admin', label: 'Dashboard', icon: Home, end: true },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/messages', label: 'Messages', icon: Mail },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];
    const footerNav = [
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
    const displayLabel = displayName.replace(/\s+/g, ' ') + ' - Pro User';

    return (
        <div className="admin-theme min-h-screen bg-[#030303]">
            {/* Main top horizontal navbar - Exact Wireframe Implementation */}
            <header className="h-20 bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50 px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-12">
                    {/* Brand Label - Far Left */}
                    <div className="flex items-center gap-3.5 group cursor-default">
                        <LaurelLogo />
                        <span className="text-sm font-bold tracking-[0.4em] uppercase text-gold whitespace-nowrap drop-shadow-[0_0_10px_rgba(197,168,114,0.3)]">Ambrosia Admin</span>
                    </div>

                    {/* Navigation Divider */}
                    <div className="h-10 w-px bg-white/5 hidden 2xl:block" />

                    {/* Main Nav Links - Center Group (Icons above Names) */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.map(({ path, label, icon: Icon, end }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={!!end}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all duration-300 group relative ${isActive
                                        ? 'text-gold drop-shadow-[0_0_8px_rgba(197,168,114,0.5)]'
                                        : 'text-gray-500 hover:text-gray-200'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>

                                        {/* Premium Glow for Active State */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gold/5 rounded-2xl blur-md -z-10 animate-pulse" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Side Controls - Exact Wireframe Order */}
                <div className="flex items-center gap-4">
                    {/* User Profile - Initial in Circle */}
                    <div className="flex items-center gap-3 pr-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm shadow-[0_0_15px_rgba(197,168,114,0.15)] ring-1 ring-gold/10">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden xl:block text-left">
                            <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest leading-none">{displayName}</p>
                            <p className="text-[9px] text-gray-500 font-medium uppercase mt-1">Administrator</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden sm:block mx-2" />

                    {/* Tool Group: Settings & Logout */}
                    <div className="flex items-center gap-3">
                        <NavLink
                            to="/admin/settings"
                            className={({ isActive }) =>
                                `p-2.5 rounded-xl border transition-all duration-300 ${isActive
                                    ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(197,168,114,0.2)]'
                                    : 'border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                }`
                            }
                            title="Settings"
                        >
                            <Settings size={20} />
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sign Out</span>
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
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
