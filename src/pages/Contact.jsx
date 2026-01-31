import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
                    <h1 className="text-6xl font-heading text-gold mb-4">Connect with Ambrosia</h1>
                    <p className="text-xl text-gray-400">Questions about our cinnamon? We're here to help.</p>
                </div>
            </section>

            <section className="contact-content py-20">
                <div className="container grid grid-cols-2 gap-20">
                    <div className="contact-info">
                        <h2 className="text-4xl font-heading text-white mb-8">Get in Touch</h2>
                        <div className="info-item mb-8">
                            <h4 className="text-gold uppercase tracking-widest text-xs mb-2">Email</h4>
                            <p className="text-xl text-gray-300">essence@ambrosiaspice.com</p>
                        </div>
                        <div className="info-item mb-8">
                            <h4 className="text-gold uppercase tracking-widest text-xs mb-2">Phone</h4>
                            <p className="text-xl text-gray-300">+94 11 234 5678</p>
                        </div>
                        <div className="info-item mb-8">
                            <h4 className="text-gold uppercase tracking-widest text-xs mb-2">Headquarters</h4>
                            <p className="text-xl text-gray-300">Galle Road, Colombo 03, Sri Lanka</p>
                        </div>
                        <div className="social-links mt-12">
                            <h4 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Follow Our Journey</h4>
                            <div className="flex gap-6">
                                <a href="#" className="text-gold hover:text-white transition-colors mr-4">Instagram</a>
                                <a href="#" className="text-gold hover:text-white transition-colors mr-4">Facebook</a>
                                <a href="#" className="text-gold hover:text-white transition-colors">LinkedIn</a>
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
