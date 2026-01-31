import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Mail, LogOut, Command, BarChart2, Users, Truck, Settings } from 'lucide-react';

const SidebarDemo = () => {
    // Mock user for demo
    const currentUser = { email: 'demo@layer1.studio' };

    return (
        <div className="flex min-h-screen bg-black text-gray-200 font-sans selection:bg-[#D4AF37] selection:text-black">

            {/* The Sidebar - Fixed, Full Height, Vertical Frame */}
            <aside className="w-72 bg-[#080808] flex flex-col fixed inset-y-0 left-0 z-[60] border-r border-white/5 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">

                {/* 1. Logo Section (Fixed Top) */}
                <div className="h-32 flex items-center px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8a6e1f] flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/20">
                            <Command size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white tracking-[0.15em] uppercase">Ambrosia</h1>
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1.5 ml-0.5">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Section (Scrollable Area) */}
                <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* Active State Demo */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)] translate-x-1 cursor-default">
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </div>

                    {/* Inactive State Demos */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                        <ShoppingBag size={18} />
                        <span>Orders</span>
                    </div>

                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                        <Package size={18} />
                        <span>Inventory</span>
                    </div>

                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                        <Mail size={18} />
                        <span>Messages</span>
                    </div>
                </nav>

                {/* 3. Footer Section (Fixed Bottom) */}
                <div className="p-8 border-t border-white/5 shrink-0 bg-[#080808]">
                    <div className="flex items-center gap-4 mb-8 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-sm border border-[#D4AF37]/20">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-white font-bold truncate uppercase tracking-wider">Administrator</p>
                            <p className="text-[10px] text-gray-500 truncate">demo@layer1.studio</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20">
                        <LogOut size={16} />
                        Sign Out System
                    </button>
                </div>
            </aside>

            {/* Main Content Area (To show independence) */}
            <main className="flex-1 ml-72 p-12 min-h-[200vh]">
                <div className="border border-white/10 rounded-3xl h-full p-12 flex items-center justify-center border-dashed">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl text-white font-serif">Content Area</h2>
                        <p className="text-gray-500">Scroll down to verify sidebar stays fixed.</p>
                        <div className="animate-bounce mt-10">↓</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SidebarDemo;
