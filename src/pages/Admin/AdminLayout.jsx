import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Package, LogOut, Mail, Users, Settings, Search, Bell } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import './Admin.css';

const BASE = '/secured-web-ambrosia/admin';

const LaurelLogo = () => (
    <img src={`${import.meta.env.BASE_URL}images/ambrosia-icon-cream.png`} alt="" className="h-[18px] w-auto shrink-0" />
);

const NAV_MAIN = [
    { path: BASE, label: 'Dashboard', icon: Home, end: true },
    { path: `${BASE}/orders`, label: 'Orders', icon: ShoppingBag },
    { path: `${BASE}/products`, label: 'Products', icon: Package },
    { path: `${BASE}/messages`, label: 'Messages', icon: Mail },
    { path: `${BASE}/customers`, label: 'Customers', icon: Users },
];

const NAV_FOOT = [
    { path: `${BASE}/settings`, label: 'Settings', icon: Settings },
];

const TITLES = {
    [BASE]: ['Dashboard', 'Live overview'],
    [`${BASE}/orders`]: ['Orders', 'Manage fulfilment'],
    [`${BASE}/products`]: ['Products', 'Catalog & inventory'],
    [`${BASE}/messages`]: ['Messages', 'Customer inbox'],
    [`${BASE}/customers`]: ['Customers', 'Clients & subscribers'],
    [`${BASE}/settings`]: ['Settings', 'Workspace configuration'],
};

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAdmin, loading } = useAuth();
    const { currency, setCurrency, availableCurrencies } = useCurrency();

    React.useEffect(() => {
        if (!loading && (!currentUser || !isAdmin)) {
            navigate('/secured-web-ambrosia/login');
        }
    }, [currentUser, isAdmin, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold animate-spin" />
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

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
    const [pageTitle, pageMeta] = TITLES[location.pathname] || ['Admin', ''];

    return (
        <div className="admin-theme min-h-screen grid" style={{ gridTemplateColumns: '224px 1fr' }}>

            {/* ===== Sidebar ===== */}
            <aside className="bg-[#0a0a0a] border-r-2 border-[#1c1a17] flex flex-col min-h-screen">
                <div className="h-16 border-b-2 border-[#1c1a17] flex items-center gap-2.5 px-5">
                    <LaurelLogo />
                    <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#f2efe9]">Ambrosia</span>
                </div>

                <div className="px-5 pt-5 pb-2">
                    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Operations</span>
                </div>
                <nav className="flex flex-col">
                    {NAV_MAIN.map(({ path, label, icon: Icon, end }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={!!end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 w-full h-[38px] px-5 border-l-2 text-[13px] transition-colors ${isActive
                                    ? 'border-gold bg-gold/[0.07] text-[#f2efe9] font-semibold'
                                    : 'border-transparent text-[#8a857e] font-medium hover:text-white'
                                }`
                            }
                        >
                            <Icon size={16} className="shrink-0" />
                            <span className="flex-1 text-left">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="px-5 pt-6 pb-2">
                    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">Workspace</span>
                </div>
                <nav className="flex flex-col">
                    {NAV_FOOT.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 w-full h-[38px] px-5 border-l-2 text-[13px] transition-colors ${isActive
                                    ? 'border-gold bg-gold/[0.07] text-[#f2efe9] font-semibold'
                                    : 'border-transparent text-[#8a857e] font-medium hover:text-white'
                                }`
                            }
                        >
                            <Icon size={16} className="shrink-0" />
                            <span className="flex-1 text-left">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto border-t-2 border-[#1c1a17] px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="user-initial-circle text-xs">{displayName.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 leading-tight">
                            <p className="m-0 text-xs font-semibold text-[#f2efe9] truncate">{displayName}</p>
                            <p className="m-0 text-[10px] text-[#615c54] uppercase tracking-[0.1em]">Admin</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 py-1 bg-transparent border-none text-[#8a857e] text-[11px] font-bold uppercase tracking-[0.12em] cursor-pointer hover:text-gold transition-colors"
                    >
                        <LogOut size={14} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* ===== Content column ===== */}
            <div className="min-w-0 flex flex-col">
                <header className="h-16 border-b-2 border-[#1c1a17] bg-[#050505] flex items-center justify-between px-7 gap-6 sticky top-0 z-20">
                    <div className="flex items-baseline gap-3.5 min-w-0">
                        <h1 className="m-0 text-[17px] font-semibold tracking-tight text-[#f2efe9]">{pageTitle}</h1>
                        <span className="text-[11px] text-[#615c54] tracking-wide hidden sm:inline">{pageMeta}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden md:flex items-center gap-2 h-[34px] px-3 border border-[#1c1a17] bg-[#0a0a0a] w-[200px]">
                            <Search size={14} className="text-[#615c54] shrink-0" />
                            <input type="text" placeholder="Search" className="flex-1 min-w-0 bg-transparent border-none text-[#f2efe9] text-xs outline-none placeholder:text-[#615c54]" />
                        </div>
                        <div className="flex items-center gap-1.5 h-[34px] px-2.5 border border-[#1c1a17] bg-[#0a0a0a]">
                            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-[#615c54]">Cur</span>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-transparent border-none font-mono text-xs font-semibold text-gold outline-none cursor-pointer"
                            >
                                {availableCurrencies.map(c => (
                                    <option key={c} value={c} className="bg-[#0a0a0a] text-white">{c}</option>
                                ))}
                            </select>
                        </div>
                        <button type="button" className="w-[34px] h-[34px] border border-[#1c1a17] bg-[#0a0a0a] text-[#8a857e] flex items-center justify-center relative hover:text-gold hover:border-[#3a352d] transition-colors">
                            <Bell size={16} />
                            <span className="absolute top-[3px] right-[3px] w-1.5 h-1.5 bg-gold" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
