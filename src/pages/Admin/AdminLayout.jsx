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
            navigate('/secured-web-ambrosia/login');
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
            navigate('/secured-web-ambrosia/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        { path: '/secured-web-ambrosia/admin', label: 'Dashboard', icon: Home, end: true },
        { path: '/secured-web-ambrosia/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/secured-web-ambrosia/admin/products', label: 'Products', icon: Package },
        { path: '/secured-web-ambrosia/admin/messages', label: 'Messages', icon: Mail },
        { path: '/secured-web-ambrosia/admin/customers', label: 'Customers', icon: Users },
    ];
    const footerNav = [
        { path: '/secured-web-ambrosia/admin/settings', label: 'Settings', icon: Settings },
    ];

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
    const displayLabel = displayName.replace(/\s+/g, ' ') + ' - Pro User';

    return (
        <div className="admin-theme min-h-screen bg-[#030303]">
            {/* Main top horizontal navbar - Fixed Layout */}
            <header className="h-20 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-50 px-6 flex items-center justify-between shadow-2xl">
                {/* Left: Brand */}
                <div className="flex items-center gap-8 min-w-max">
                    <div className="flex items-center gap-3">
                        <LaurelLogo />
                        <span className="text-sm font-bold tracking-[0.3em] uppercase text-gold whitespace-nowrap">Ambrosia Admin</span>
                    </div>

                    {/* Navigation Divider - Only on very wide screens */}
                    <div className="h-8 w-px bg-white/10 hidden xl:block" />
                </div>

                {/* Center: Navigation - Always Visible */}
                <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar mx-4">
                    {navItems.map(({ path, label, icon: Icon, end }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={!!end}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 group min-w-[70px] ${isActive
                                    ? 'text-gold'
                                    : 'text-gray-500 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(197,168,114,0.5)]' : 'group-hover:scale-110'}`} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>

                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute -bottom-[26px] left-0 right-0 h-[2px] bg-gold shadow-[0_0_10px_#c5a872]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Right: User Controls */}
                <div className="flex items-center gap-3 min-w-max">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 pr-2">
                        <div className="user-initial-circle bg-gold/10 border border-gold/30 text-gold font-bold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    {/* Tools */}
                    <div className="flex items-center gap-2">
                        <NavLink
                            to="/secured-web-ambrosia/admin/settings"
                            className={({ isActive }) =>
                                `p-2 rounded-lg transition-all ${isActive ? 'text-gold bg-gold/5' : 'text-gray-400 hover:text-white'
                                }`
                            }
                            title="Settings"
                        >
                            <Settings size={20} />
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-transparent border-none p-0">Sign Out</span>
                            <LogOut size={14} />
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
