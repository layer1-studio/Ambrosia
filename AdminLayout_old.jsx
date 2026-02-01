import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, Mail, Search, Bell, Megaphone, Menu, Command, BarChart2, Users, Truck, Settings } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAdmin, loading } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        if (!loading && (!currentUser || !isAdmin)) {
            navigate('/admin/login');
        }
    }, [currentUser, isAdmin, loading, navigate]);

    // Close sidebar on navigation (mobile)
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

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
        <div className="admin-theme flex flex-col md:flex-row text-gray-200 selection:bg-gold selection:text-black relative">
            {/* Mobile Header */}
            <header className="md:hidden h-20 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-black font-bold text-lg">A</div>
                    <h1 className="text-sm font-heading text-white tracking-widest uppercase">Ambrosia</h1>
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gold hover:bg-gold/10 rounded-xl transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Sidebar - Overlay on mobile, Fixed on desktop */}
            <aside className={`
                w-72 bg-[#080808] flex flex-col fixed inset-y-0 left-0 z-[60] border-r border-white/5
                transition-transform duration-500 ease-out h-screen
                md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-32 flex items-center px-8">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8a6e1f] flex items-center justify-center text-black shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform duration-500">
                            <Command size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading text-white tracking-[0.15em] uppercase">Ambrosia</h1>
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1.5 ml-0.5">Admin</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto custom-scrollbar flex flex-col">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] translate-x-1' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] translate-x-1' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <ShoppingBag size={18} />
                        <span>Orders</span>
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] translate-x-1' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Package size={18} />
                        <span>Products</span>
                    </NavLink>

                    <NavLink
                        to="/admin/messages"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] translate-x-1' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Mail size={18} />
                        <span>Messages</span>
                    </NavLink>
                </nav>

                <div className="p-8 border-t border-white/5">
                    <div className="flex items-center gap-4 mb-8 p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-gold/20 transition-colors cursor-default group">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm border border-gold/20 group-hover:bg-gold group-hover:text-black transition-colors">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-white font-bold truncate uppercase tracking-wider group-hover:text-gold transition-colors">Administrator</p>
                            <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 relative bg-[#0a0a0a] min-w-0 flex flex-col min-h-screen md:ml-72">
                {/* Top Header Bar */}
                <header className="hidden md:flex items-center justify-between gap-6 px-8 py-6 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 sticky top-0 z-40">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="admin-input pl-14"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                            <button className="p-3 rounded-xl text-gray-500 hover:text-gold hover:bg-gold/5 transition-all relative" aria-label="Notifications">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                            </button>
                            <button className="p-3 rounded-xl text-gray-500 hover:text-gold hover:bg-gold/5 transition-all" aria-label="Announcements">
                                <Megaphone size={20} />
                            </button>
                        </div>
                        <Link to="/" className="px-6 py-3 rounded-xl bg-gold text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                            View Storefront
                        </Link>
                    </div>
                </header>
                <div className="w-full p-8 flex-1 min-h-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
