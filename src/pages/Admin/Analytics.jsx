import React from 'react';
import { BarChart3, TrendingUp, Layers, Zap } from 'lucide-react';
import './Admin.css';

const Analytics = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-reveal">
            <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold animate-pulse">
                    <BarChart3 size={48} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black">
                    <Zap size={16} fill="currentColor" />
                </div>
            </div>

            <div className="text-center max-w-md space-y-4">
                <h1 className="text-4xl font-heading text-white">Advanced Insights</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                    We're currently architecting a powerful analytics engine to track your boutique's performance, from session metrics to harvest-yield forecasting.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 opacity-40">
                    <TrendingUp size={20} className="text-gold" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Sales Velocity</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 opacity-40">
                    <Layers size={20} className="text-gold" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Inventory Flow</span>
                </div>
            </div>

            <div className="pt-8">
                <span className="px-4 py-2 rounded-full border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
                    Coming Soon to Divine Essence
                </span>
            </div>
        </div>
    );
};

export default Analytics;
