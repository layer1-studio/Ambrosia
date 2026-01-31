import React, { useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await addDoc(collection(db, "subscribers"), {
                email,
                date: new Date().toISOString()
            });
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error("Error subscribing:", error);
            setStatus('error');
        }
    };

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
                        <h4 className="font-heading text-white mb-8 tracking-widest text-[10px] uppercase">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link to="/shop" className="text-gray-500 hover:text-gold text-xs transition-colors">Digital Boutique</Link></li>
                            <li><Link to="/about-cinnamon" className="text-gray-500 hover:text-gold text-xs transition-colors">The Alchemist's Guide</Link></li>
                            <li><Link to="/recipes" className="text-gray-500 hover:text-gold text-xs transition-colors">Gastronomy & Rites</Link></li>
                            <li><Link to="/faq" className="text-gray-500 hover:text-gold text-xs transition-colors">Inquiries</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4 className="font-heading text-white mb-8 tracking-widest text-[10px] uppercase">Statutes</h4>
                        <ul className="space-y-4">
                            <li><Link to="/contact" className="text-gray-500 hover:text-gold text-xs transition-colors">Liaison</Link></li>
                            <li><Link to="/privacy" className="text-gray-500 hover:text-gold text-xs transition-colors">Data Protocol</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-gold text-xs transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Newsletter</h4>
                        {status === 'success' ? (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                                <span className="block text-xl mb-1">✓</span>
                                Thank you for subscribing!
                            </div>
                        ) : (
                            <form className="newsletter-form mt-4" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="bg-[#1a1a1a] border border-white/10 p-2 text-sm w-full mb-2 focus:border-gold outline-none transition-colors text-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="btn-outline w-full py-2 text-xs disabled:opacity-50"
                                >
                                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                                </button>
                                {status === 'error' && <p className="text-red-500 text-xs mt-2">Something went wrong. Try again.</p>}
                            </form>
                        )}
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
