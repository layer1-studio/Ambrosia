import React from 'react';
import { Link } from 'react-router-dom';
import './BrandIntro.css';

const BrandIntro = () => {
    return (
        <section id="heritage" className="brand-intro-section">
            <div className="container">
                <div className="intro-grid">
                    <div className="intro-text">
                        <span className="gold-label">Our Mission</span>
                        <h2 className="text-4xl font-heading mb-6 text-white">Ambrosia — The True Gold of the East</h2>
                        <p className="intro-p">
                            Born from the sun-drenched coastal estates of Sri Lanka, Ambrosia is a tribute to the legendary
                            'Gold of the East'. We specialize exclusively in true Ceylon Cinnamon (Cinnamomum Verum) —
                            the only authentic variety, celebrated for its delicate complexity and profound health benefits.
                        </p>
                        <p className="intro-p">
                            Our mission is singular: To bring the finest grade cinnamon, once reserved for
                            European royalty, directly to the modern connoisseur.
                        </p>
                    </div>
                    <div className="quick-links">
                        <h3 className="text-xl font-heading mb-6 text-gold">Explore Ambrosia</h3>
                        <div className="links-stack">
                            <Link to="/shop" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>The Collection</h4>
                                    <p>Acquire our finest quills, powders, and artisanal blends.</p>
                                </div>
                            </Link>
                            <Link to="/about-cinnamon" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>The Cinnamon Legacy</h4>
                                    <p>Understand the distinction between true Verum and common Cassia.</p>
                                </div>
                            </Link>
                            <Link to="/recipes" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>Culinary Journey</h4>
                                    <p>Explore curated recipes and wellness rituals.</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandIntro;
