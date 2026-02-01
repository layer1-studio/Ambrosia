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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
            {/* Top Navigation Bar */}
            <header className="h-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] px-6 md:px-12 flex items-center justify-between">
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
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
                                    flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                                    ${isActive
                                        ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] translate-y-[-1px]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <item.icon size={16} />
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

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-6 md:pl-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold/20 to-gold/5 flex items-center justify-center text-gold font-bold text-xs border border-gold/20">
                                {currentUser?.email?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={14} />
                                <span>Exit</span>
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-gold"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 p-4 absolute top-20 left-0 right-0 z-50 animate-slide-in-right">
                    <nav className="flex flex-col space-y-2">
                        {[
                            { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                            { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
                            { path: '/admin/products', label: 'Products', icon: Package },
                            { path: '/admin/messages', label: 'Messages', icon: Mail }
                        ].map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest
                                    ${isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}
                                `}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 max-w-[1600px] mx-auto w-full animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
