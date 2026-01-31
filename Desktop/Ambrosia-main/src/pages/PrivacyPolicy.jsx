import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

const PrivacyPolicy = () => {
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
                        Privacy Policy & Terms.
                    </h1>
                </header>

                <section className="mb-12">
                    <h2 className="legal-section-title text-gold">1. Introduction</h2>
                    <p className="legal-section-body">
                        Ambrosia is committed to transparency and the protection of your digital presence. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform. We provide an overview of the data we gather and how we use it to improve your experience. We are committed to being accountable and updating this policy as needed.
                    </p>
                </section>

                <div className="legal-summary-box">
                    <p><strong>Simple Summary:</strong></p>
                    <p>We collect minimal data to improve your experience. We never sell your data. You control your privacy and can request access, correction, or deletion at any time. See full policy for details.</p>
                </div>

                <Divider />

                <div className="legal-two-col gap-12 md:gap-16">
                    <section>
                        <h2 className="legal-section-title text-gold">2. Data We Collect</h2>
                        <p className="legal-section-body">
                            We collect minimal data to improve your experience: identification (name, email), transaction and order details, and usage information when you visit our site. We never sell your data. You can request a copy of the data we hold or ask for deletion via our contact page.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">4. Contact Us</h2>
                        <p className="legal-section-body">
                            For privacy-related questions or to exercise your rights (access, rectify, or delete your data), please contact us via our <Link to="/contact" className="text-gold hover:underline">Contact</Link> page. We are committed to responding to legitimate requests in a timely manner.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">3. Your Rights</h2>
                        <p className="legal-section-body">
                            You maintain full rights to access, rectify, or request deletion of your personal data from our systems at any time. You may also object to certain processing or request data portability where applicable. Contact our privacy liaison for immediate execution of these rights.
                        </p>
                    </section>
                    <section>
                        <h2 className="legal-section-title text-gold">Security & Storage</h2>
                        <p className="legal-section-body">
                            Your data is secured using industry-standard TLS encryption. Financial transactions are processed via secure gateways. Records are maintained only as long as necessary to fulfill service obligations or legal requirements. We use distributed cloud infrastructure with multi-layer access controls.
                        </p>
                    </section>
                </div>

                <Divider />

                <footer className="pt-8 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">Registry Safeguard: Active</p>
                    <p className="text-[9px] text-gray-700 italic uppercase tracking-[0.2em]">Last Revision: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
