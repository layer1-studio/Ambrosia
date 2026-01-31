import React from 'react';
import './Contact.css';

const Contact = () => {
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
                                <a href="#" className="text-gold hover:text-white transition-colors">Instagram</a>
                                <a href="#" className="text-gold hover:text-white transition-colors">Facebook</a>
                                <a href="#" className="text-gold hover:text-white transition-colors">LinkedIn</a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form">
                            <div className="form-group mb-6">
                                <input type="text" placeholder="Your Name" className="form-input" />
                            </div>
                            <div className="form-group mb-6">
                                <input type="email" placeholder="Email Address" className="form-input" />
                            </div>
                            <div className="form-group mb-6">
                                <select className="form-input">
                                    <option>General Inquiry</option>
                                    <option>Wholesale/B2B</option>
                                    <option>Order Support</option>
                                    <option>Press</option>
                                </select>
                            </div>
                            <div className="form-group mb-8">
                                <textarea placeholder="How can we help?" className="form-input h-32"></textarea>
                            </div>
                            <button type="submit" className="btn w-full">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
