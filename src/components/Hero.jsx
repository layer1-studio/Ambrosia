import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/images/hero_bg.png';
import './Hero.css';

const Hero = () => {
    const bgRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame;
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const offset = Math.min(window.scrollY, window.innerHeight) * 0.35;
                if (bgRef.current) {
                    bgRef.current.style.transform = `translateY(${offset}px)`;
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <section id="home" className="hero">
            <div className="hero-bg" ref={bgRef}>
                <img src={heroBg} alt="Cinnamon Background" />
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
                <span className="hero-eyebrow">Ambrosia — The Sovereign Spice of Ceylon</span>
                <h1 className="hero-title">
                    Divine Essence
                </h1>
                <p className="hero-desc">
                    Experience the gold standard of spices. Authentic,
                    hand-harvested Ceylon Cinnamon, cultivated in the heart of Sri Lanka.
                </p>
                <div className="hero-actions">
                    <Link to="/shop" className="btn">View Collection</Link>
                    <Link to="/about-us" className="btn btn-outline" style={{ marginLeft: '1rem' }}>Our Heritage</Link>
                </div>
            </div>
        </section>
    );
};
export default Hero;
