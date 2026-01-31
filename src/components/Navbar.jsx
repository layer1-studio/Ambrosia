import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { cartCount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    Ambrosia
                </Link>

                {/* Desktop Links */}
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
                    <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Digital Boutique</NavLink>
                    <NavLink to="/about-cinnamon" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>The Alchemist's Guide</NavLink>
                    <NavLink to="/recipes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Gastronomy & Rites</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Liaison</NavLink>
                </div>

                <div className="nav-actions flex items-center gap-6">
                    <Link to="/cart" className="cart-link relative text-white hover:text-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        {cartCount > 0 && (
                            <span className="cart-badge absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/shop" className="btn-outline nav-btn">
                        Shop Now
                    </Link>

                    {/* Mobile Toggle */}
                    <div className="nav-toggle" onClick={toggleMenu}>
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
                    <div className="mobile-nav-links">
                        <NavLink to="/" onClick={toggleMenu} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
                        <NavLink to="/shop" onClick={toggleMenu} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>Digital Boutique</NavLink>
                        <NavLink to="/about-cinnamon" onClick={toggleMenu} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>The Alchemist's Guide</NavLink>
                        <NavLink to="/recipes" onClick={toggleMenu} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>Gastronomy & Rites</NavLink>
                        <NavLink to="/contact" onClick={toggleMenu} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>Liaison</NavLink>
                        <Link to="/shop" onClick={toggleMenu} className="btn-primary mt-8 inline-block text-center">Inquire Now</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
