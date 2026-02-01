import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Layout, Globe } from 'lucide-react';
import './Admin.css';

const Settings = () => {
    return (
        <div className="space-y-8 animate-reveal">
            <header>
                <h1 className="admin-section-title admin-title text-2xl md:text-3xl font-heading text-gold mb-1">Command Settings</h1>
                <p className="text-gray-500 text-sm">Configure your administrative workspace and data protocols.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gold/10 text-gold"><Shield size={24} /></div>
                        <div>
                            <h3 className="text-white font-medium">Security & Access</h3>
                            <p className="text-xs text-gray-500">Manage admin credentials and session protocols.</p>
                        </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gold/10 text-gold"><Bell size={24} /></div>
                        <div>
                            <h3 className="text-white font-medium">Notification Rules</h3>
                            <p className="text-xs text-gray-500">Configure order alerts and system status pings.</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gold/10 text-gold"><Layout size={24} /></div>
                        <div>
                            <h3 className="text-white font-medium">Interface Preferences</h3>
                            <p className="text-xs text-gray-500">Customize the high-density dashboard theme.</p>
                        </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gold/10 text-gold"><Globe size={24} /></div>
                        <div>
                            <h3 className="text-white font-medium">Currency & Liaison</h3>
                            <p className="text-xs text-gray-500">Set global pricing rules and contact logic.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 glass-panel rounded-2xl border border-gold/10 bg-gold/5 text-center">
                <SettingsIcon size={32} className="text-gold mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-gold font-heading text-xl mb-2">Protocol Update in Progress</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    The settings module is being updated to support advanced administrative features. Access will be restored shortly.
                </p>
            </div>
        </div>
    );
};

export default Settings;
