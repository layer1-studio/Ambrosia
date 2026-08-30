import React from 'react';
import { BarChart3 } from 'lucide-react';
import './Admin.css';

const Analytics = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <BarChart3 size={28} className="text-gold mb-5" />
            <h1 className="text-lg font-semibold text-[#f2efe9] mb-2">Advanced insights</h1>
            <p className="text-[#8a857e] text-sm leading-relaxed max-w-sm">
                Session metrics and inventory-flow forecasting for the storefront are in development.
            </p>
            <span className="mt-6 px-3 py-1.5 border border-[#3a352d] text-gold text-[10px] font-bold uppercase tracking-[0.14em]">Coming soon</span>
        </div>
    );
};

export default Analytics;
