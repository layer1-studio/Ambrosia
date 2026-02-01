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
            {/* Main top horizontal navbar */}
            <header className="h-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Brand Label - Far Left */}
                    <div className="flex items-center gap-3">
                        <LaurelLogo />
                        <span className="text-sm font-bold tracking-[0.3em] uppercase text-gold whitespace-nowrap">Ambrosia Admin</span>
                    </div>

                    {/* Navigation Divider */}
                    <div className="h-8 w-px bg-white/10 hidden xl:block" />

                    {/* Main Nav Links - Center Group */}
                    <nav className="hidden lg:flex items-center gap-1">
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

                {/* Right Side Controls */}
                <div className="flex items-center gap-4">
                    {/* Account Name - Initial in Circle */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{displayName}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Dashboard Tools */}
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                        <NavLink
                            to="/admin/settings"
                            className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? 'text-gold' : 'text-gray-500 hover:text-white'}`}
                            title="Settings"
                        >
                            <Settings size={20} />
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Logout"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                            <LogOut size={16} />
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
