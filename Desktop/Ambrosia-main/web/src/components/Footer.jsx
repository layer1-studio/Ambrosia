import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-column">
                        <h4 className="font-heading">Ambrosia</h4>
                        <p className="text-gray-500 text-sm leading-7">
                            Delivering the 100% authentic essence of Sri Lankan Ceylon Cinnamon to the world. A commitment
                            to purity, heritage, and health.
                        </p>
                    </div>
                    <div className="footer-column">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/shop">Online Store</Link></li>
                            <li><Link to="/about-cinnamon">About Cinnamon</Link></li>
                            <li><Link to="/recipes">Recipes & Blog</Link></li>
                            <li><Link to="/faq">FAQs</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Newsletter</h4>
                        <div className="newsletter-form mt-4">
                            <input type="email" placeholder="Your email address" className="bg-[#1a1a1a] border border-white/10 p-2 text-sm w-full mb-2" />
                            <button className="btn-outline w-full py-2 text-xs">Subscribe</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Ambrosia 100% Sri Lankan Cinnamon. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
