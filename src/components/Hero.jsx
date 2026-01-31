import React from 'react';
import heroBg from '../assets/images/hero_bg.png';
import './Hero.css';

const Hero = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-bg">
                <img src={heroBg} alt="Cinnamon Background" />
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
                <span className="hero-eyebrow">Ambrosia – Pure, Premium 100% Sri Lankan Cinnamon</span>
                <h1 className="hero-title">
                    Divine Essence
                </h1>
                <p className="hero-desc">
                    Experience the gold standard of spices. 100% authentic,
                    hand-harvested Ceylon cinnamon from the heart of Sri Lanka.
                </p>
                <div className="hero-actions">
                    <a href="#products" className="btn">Shop Now</a>
                    <a href="#heritage" className="btn btn-outline" style={{ marginLeft: '1rem' }}>Learn More</a>
                </div>
            </div>
        </section>
    );
};
export default Hero;
