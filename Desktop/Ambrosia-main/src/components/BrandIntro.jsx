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
                        <h2 className="text-4xl font-heading mb-6 text-white">Ambrosia – Pure, Premium 100% Sri Lankan Cinnamon</h2>
                        <p className="intro-p">
                            Born from the sun-drenched coastal gardens of Sri Lanka, Ambrosia is a tribute to the legendary
                            'Gold of the East'. We specialize exclusively in true Ceylon Cinnamon (Cinnamomum Verum) –
                            the only 100% authentic, low-coumarin variety that offers genuine health benefits and
                            a sophisticated sweetness.
                        </p>
                        <p className="intro-p">
                            Our mission is simple: To bring the finest grade cinnamon, usually reserved for
                            the royal houses of the world, directly to your kitchen.
                        </p>
                    </div>
                    <div className="quick-links">
                        <h3 className="text-xl font-heading mb-6 text-gold">Explore Ambrosia</h3>
                        <div className="links-stack">
                            <Link to="/shop" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>Online Shop</h4>
                                    <p>Browse our sticks, powders, and blends.</p>
                                </div>
                            </Link>
                            <Link to="/about-cinnamon" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>About Cinnamon</h4>
                                    <p>Learn the difference between Ceylon and Cassia.</p>
                                </div>
                            </Link>
                            <Link to="/recipes" className="quick-link-item">
                                <span className="link-icon">→</span>
                                <div className="link-content">
                                    <h4>Recipes & Blog</h4>
                                    <p>Discover healthy ways to use cinnamon.</p>
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
