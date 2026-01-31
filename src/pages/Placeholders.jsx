import React from 'react';

// Reusing this for pages not yet implemented
const PlaceholderPage = ({ title }) => (
    <div className="section" style={{ paddingTop: '150px', minHeight: '80vh' }}>
        <div className="container text-center">
            <h1 className="text-6xl text-gold mb-8">{title}</h1>
            <p className="text-xl text-gray-500">This section is coming soon.</p>
        </div>
    </div>
);

export const Cart = () => <PlaceholderPage title="Your Selection" />;

export const PrivacyPolicy = () => (
    <div className="legal-page pt-40 pb-24 bg-[#050505] min-h-screen text-gray-300 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="container max-w-4xl relative z-10">
            <div className="mb-16">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Legal Documentation</span>
                <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 tracking-tight">Privacy Policy</h1>
                <p className="text-gray-500 uppercase text-[10px] tracking-[0.3em] font-medium opacity-60">Last Updated: January 31, 2026</p>
            </div>

            <div className="bg-[#111] border border-gold/20 p-8 md:p-12 rounded-[2.5rem] mb-20 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
                <h3 className="text-gold font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold/30"></span>
                    Simple English Summary
                </h3>
                <p className="text-xl md:text-2xl text-white/90 italic font-light leading-relaxed">
                    "Basically: We utilize your data solely to ship your cinnamon and keep you updated. We never sell your info to weird third parties. Your payment details are secure and we don't even see them."
                </p>
            </div>

            <div className="space-y-20 text-gray-400">
                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">01</span>
                        Information Collection
                    </h2>
                    <div className="space-y-4 font-light leading-relaxed">
                        <p>At Ambrosia, trust is our most precious ingredient. We collect information you provide directly to us through:</p>
                        <ul className="list-disc ml-6 space-y-2 text-sm text-gray-500">
                            <li>Account registration and profile management</li>
                            <li>Secure checkout and transaction processing</li>
                            <li>Newsletter subscriptions and marketing preferences</li>
                            <li>Customer support inquiries</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">02</span>
                        Data Utilization
                    </h2>
                    <p className="font-light leading-relaxed">
                        Your data is used exclusively to fulfill our promise to you. This includes logistics coordination,
                        quality assurance, and occasional updates about our harvest. We operate with a strict
                        <strong> zero-sharing policy</strong> regarding third-party data brokers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">03</span>
                        Global Security Standards
                    </h2>
                    <p className="font-light leading-relaxed">
                        We employ enterprise-grade encryption and partner with industry-leading payment gateways.
                        Ambrosia never stores sensitive credit card data on our local servers, ensuring your
                        financial integrity remains untouched.
                    </p>
                </section>
            </div>
        </div>
    </div>
);

export const Terms = () => (
    <div className="legal-page pt-40 pb-24 bg-[#050505] min-h-screen text-gray-300 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2"></div>

        <div className="container max-w-4xl relative z-10">
            <div className="mb-16">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">User Agreement</span>
                <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 tracking-tight">Terms & Conditions</h1>
                <p className="text-gray-500 uppercase text-[10px] tracking-[0.3em] font-medium opacity-60">Last Updated: January 31, 2026</p>
            </div>

            <div className="bg-[#111] border border-gold/20 p-8 md:p-12 rounded-[2.5rem] mb-20 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
                <h3 className="text-gold font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold/30"></span>
                    Simple English Summary
                </h3>
                <p className="text-xl md:text-2xl text-white/90 italic font-light leading-relaxed">
                    "Basically: We promise to send you high-quality cinnamon. Shipping takes a few days. Since it's food, we can't take returns unless we messed up. Be nice to our website."
                </p>
            </div>

            <div className="space-y-20 text-gray-400">
                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">01</span>
                        Acceptance of Terms
                    </h2>
                    <p className="font-light leading-relaxed">
                        By accessing the Ambrosia digital storefront, you acknowledge and agree to abide by these Terms.
                        We reserve the right to modify these terms at any time to reflect changes in our service or
                        the regulatory landscape.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">02</span>
                        Product Authenticity & Pricing
                    </h2>
                    <p className="font-light leading-relaxed">
                        Ambrosia guarantees that all products labeled "Ceylon Cinnamon" are sourced directly
                        from Sri Lanka. While we strive for accuracy, availability and pricing may fluctuate
                        based on seasonal harvest conditions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-heading mb-6 flex items-center gap-4">
                        <span className="text-gold text-sm font-mono opacity-50">03</span>
                        Shipping & Perishables
                    </h2>
                    <p className="font-light leading-relaxed">
                        Due to the culinary and perishable nature of our products, all sales are final.
                        However, we stand behind our quality—if your shipment is compromised during transit,
                        please contact our support team within 48 hours for immediate resolution.
                    </p>
                </section>
            </div>
        </div>
    </div>
);
