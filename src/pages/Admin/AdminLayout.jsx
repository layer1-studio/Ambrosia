import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, Mail, Search, Bell, Megaphone, Menu, Command, BarChart2, Users, Truck, Settings } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { currentUser, isAdmin, loading } = useAuth();

    React.useEffect(() => {
        if (!loading && (!currentUser || !isAdmin)) {
            navigate('/admin/login');
        }
    }, [currentUser, isAdmin, loading, navigate]);

    if (loading) return <div className="min-h-screen bg-black text-gold flex items-center justify-center font-heading tracking-widest uppercase text-xs">Loading Secure Environment...</div>;

    if (!currentUser || !isAdmin) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="admin-theme min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-gold selection:text-black">
            {/* Top Navigation Bar - matches main site Navbar style */}
            <header className="h-16 md:h-20 bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5 fixed top-0 left-0 right-0 z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                <div className="mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-12">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8a6e1f] flex items-center justify-center text-black shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform duration-500">
                                <Command size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl font-heading text-white tracking-[0.15em] uppercase">Ambrosia</h1>
                                <p className="text-[8px] text-gray-500 uppercase tracking-[0.3em] font-bold ml-0.5">Admin</p>
                            </div>
                        </Link>

                        {/* Horizontal Navigation */}
                        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar max-w-[calc(100vw-200px)] md:max-w-none">
                            {[
                                { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                                { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
                                { path: '/admin/products', label: 'Products', icon: Package },
                                { path: '/admin/messages', label: 'Messages', icon: Mail }
                            ].map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    className={({ isActive }) => `
                                    flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 shrink-0
                                    ${isActive
                                            ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] translate-y-[-1px]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}
                                >
                                    <item.icon size={14} className="md:w-4 md:h-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 border-r border-white/10 pr-6">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-white/5 border border-transparent focus:border-gold/30 rounded-full py-2 pl-10 pr-4 text-xs w-48 text-white placeholder-gray-600 transition-all outline-none"
                                />
                            </div>
                            <button className="relative p-2 text-gray-400 hover:text-gold transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-4 md:pl-0">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-gold/20 to-gold/5 flex items-center justify-center text-gold font-bold text-xs border border-gold/20">
                                {currentUser?.email?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Exit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 md:pt-20 p-6 md:p-12 max-w-[1600px] mx-auto w-full animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
