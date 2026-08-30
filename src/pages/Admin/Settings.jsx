import React from 'react';
import { Shield, Bell, Globe, Mail, Layout, Download } from 'lucide-react';
import './Admin.css';

const SECTIONS = [
    { icon: Shield, title: 'Security & access', body: "Manage admin credentials, session length and two-factor enrolment for every account with back-office access.", action: 'Manage' },
    { icon: Bell, title: 'Notification rules', body: 'Choose which order events send an email, and who on the team receives inventory and refund alerts.', action: 'Configure' },
    { icon: Globe, title: 'Currency & pricing', body: 'Set the base currency, exchange-rate source and rounding rule applied across the storefront and invoices.', action: 'Edit rules' },
    { icon: Mail, title: 'Email templates', body: 'Edit the order confirmation, shipping and reply templates sent to customers from this workspace.', action: 'Open editor' },
    { icon: Layout, title: 'Interface', body: 'Density, default landing screen and table columns for your own account. Changes apply only to you.', action: 'Adjust' },
    { icon: Download, title: 'Data export', body: 'Download orders, customers and inventory as CSV, or schedule a nightly export to your warehouse.', action: 'Export' },
];

const Settings = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ maxWidth: 1100 }}>
            {SECTIONS.map(({ icon: Icon, title, body, action }, i) => (
                <section
                    key={title}
                    className="px-7 py-6"
                    style={{
                        borderRight: i % 2 === 0 ? '1px solid #1c1a17' : 'none',
                        borderBottom: '1px solid #1c1a17',
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <Icon size={15} className="text-gold" />
                        <h2 className="admin-section-title text-[#f2efe9] mb-0">{title}</h2>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-[#8a857e]" style={{ maxWidth: '44ch' }}>{body}</p>
                    <button type="button" className="btn-premium btn-premium-outline mt-4">{action}</button>
                </section>
            ))}
        </div>
    );
};

export default Settings;
