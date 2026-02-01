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
                        <h2 className="contact-info-title">Get in Touch</h2>

                        <div className="contact-methods">
                            <div className="contact-method-item">
                                <div className="method-icon-wrap">
                                    <Mail size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="method-label">Email Essence</h4>
                                    <p className="method-value">essence@ambrosiaspice.com</p>
                                </div>
                            </div>

                            <div className="contact-method-item">
                                <div className="method-icon-wrap">
                                    <Phone size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="method-label">Voice Liaison</h4>
                                    <p className="method-value">+94 11 234 5678</p>
                                </div>
                            </div>

                            <div className="contact-method-item">
                                <div className="method-icon-wrap">
                                    <MapPin size={20} />
                                </div>
                                <div className="method-details">
                                    <h4 className="method-label">Global HQ</h4>
                                    <p className="method-value">Galle Road, Colombo 03, <br />Sri Lanka</p>
                                </div>
                            </div>
                        </div>

                        <div className="social-presence">
                            <h4 className="social-presence-label">Follow Our Journey</h4>
                            <div className="social-link-grid">
                                <a href="#" className="social-link-item">
                                    <div className="social-icon">
                                        <Instagram size={18} />
                                    </div>
                                    <span>Instagram</span>
                                </a>
                                <a href="#" className="social-link-item">
                                    <div className="social-icon">
                                        <Facebook size={18} />
                                    </div>
                                    <span>Facebook</span>
                                </a>
                                <a href="#" className="social-link-item">
                                    <div className="social-icon">
                                        <Linkedin size={18} />
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
