import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const Divider = () => (
        <div className="legal-divider">
            <div className="flourish" />
        </div>
    );

    return (
        <div className="legal-page">
            <div className="container max-w-4xl mx-auto">
                <header className="text-center mb-16 animate-fade-in">
                    <h1 className="legal-title text-gold">
                        Terms and Conditions.
                    </h1>
                </header>

                <section className="mb-12">
                    <h2 className="legal-section-title text-gold">1. Introduction</h2>
                    <p className="legal-section-body">
                        By accessing the Ambrosia digital environment, you acknowledge and agree to abide by these established protocols governing acquisition, interaction, and digital conduct. These terms serve as the foundational covenant for your engagement with our curated offerings.
                    </p>
                </section>

                <div className="legal-summary-box">
                    <p><strong>Simple Summary:</strong></p>
                    <p>We provide a premium platform for Ceylon cinnamon and related products. By using our site you agree to fair use, accurate information, and respect for our intellectual property. Disputes are resolved through binding arbitration. See full terms for details.</p>
                </div>

                <Divider />

                <div className="legal-two-col gap-12 md:gap-16">
                    <section>
                        <h2 className="legal-section-title text-gold">2. Engagement & Conduct</h2>
                        <p className="legal-section-body">
                            All physical and digital assets curated by Ambrosia are subject to availability and verification. We reserve the right to limit quantities or refuse service at our discretion. Engagement with our platform requires adherence to high-fidelity communication: no automated scraping, verification of identification data, respect for proprietary design, and authorized use of acquisition channels.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">4. Contact Us</h2>
                        <p className="legal-section-body">
                            For questions regarding these terms, please contact us via our <Link to="/contact" className="text-gold hover:underline">Contact</Link> page. We are committed to transparency and will respond to legitimate inquiries in a timely manner.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">3. Liability & Governing Law</h2>
                        <p className="legal-section-body">
                            Ambrosia and its affiliates shall not be held liable for indirect, incidental, or consequential damages arising from the use of our digital platforms or curated assets. These conditions are governed by applicable jurisdiction statutes. Any disputes shall be resolved through binding arbitration in accordance with established commercial protocols.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">Intellectual Property</h2>
                        <p className="legal-section-body">
                            All aesthetic elements, including visual iconography, typography, and curated content within this portal, are the exclusive property of Ambrosia. Unauthorized replication is strictly prohibited. We protect our intellectual assets through appropriate legal and technical measures.
                        </p>
                    </section>
                </div>

                <Divider />

                <footer className="pt-8 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">Protocol Status: Active</p>
                    <p className="text-[9px] text-gray-700 italic uppercase tracking-[0.2em]">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </footer>
            </div>
        </div>
    );
};

export default Terms;
