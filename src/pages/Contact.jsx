import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'messages'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new' // new, read, replied
            });
            alert('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container text-center">
                    <h1 className="text-6xl font-heading text-gold mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-400">Questions about our cinnamon? We're here to help.</p>
                </div>
            </section>

            <section className="contact-content py-20">
                <div className="container grid grid-cols-2 gap-20">
                    <div className="contact-info">
                        <h2 className="text-4xl font-heading text-white mb-10">Get in Touch</h2>

                        <div className="contact-methods space-y-10">
                            <div className="contact-method-item flex items-start gap-6 group">
                                <div className="method-icon-wrap w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="text-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Email Essence</h4>
                                    <p className="text-xl text-white font-medium">essence@ambrosiaspice.com</p>
                                </div>
                            </div>

                            <div className="contact-method-item flex items-start gap-6 group">
                                <div className="method-icon-wrap w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                                    <Phone size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="text-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Voice Liaison</h4>
                                    <p className="text-xl text-white font-medium">+94 11 234 5678</p>
                                </div>
                            </div>

                            <div className="contact-method-item flex items-start gap-6 group">
                                <div className="method-icon-wrap w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="text-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Global HQ</h4>
                                    <p className="text-xl text-white font-medium leading-snug">Galle Road, Colombo 03, <br />Sri Lanka</p>
                                </div>
                            </div>
                        </div>

                        <div className="social-presence mt-16 pt-10 border-t border-white/5">
                            <h4 className="text-gray-500 uppercase tracking-[0.1em] text-[10px] font-bold mb-6 italic">Follow Our Journey</h4>
                            <div className="flex gap-8">
                                <a href="#" className="social-link-item group flex items-center gap-3 text-gold/60 hover:text-white transition-all text-sm">
                                    <div className="social-icon w-8 h-8 rounded-lg border border-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Instagram size={16} />
                                    </div>
                                    <span>Instagram</span>
                                </a>
                                <a href="#" className="social-link-item group flex items-center gap-3 text-gold/60 hover:text-white transition-all text-sm">
                                    <div className="social-icon w-8 h-8 rounded-lg border border-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Facebook size={16} />
                                    </div>
                                    <span>Facebook</span>
                                </a>
                                <a href="#" className="social-link-item group flex items-center gap-3 text-gold/60 hover:text-white transition-all text-sm">
                                    <div className="social-icon w-8 h-8 rounded-lg border border-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Linkedin size={16} />
                                    </div>
                                    <span>LinkedIn</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group mb-6">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group mb-6">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group mb-6">
                                <select
                                    name="subject"
                                    className="form-input"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option>General Inquiry</option>
                                    <option>Wholesale/B2B</option>
                                    <option>Order Support</option>
                                    <option>Press</option>
                                </select>
                            </div>
                            <div className="form-group mb-8">
                                <textarea
                                    name="message"
                                    placeholder="How can we help?"
                                    className="form-input h-32"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn w-full" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
