import React from 'react';
import './Testimonials.css';

const testimonials = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "Professional Baker",
        content: "The aroma of Ambrosia's Divine Essence is incomparable. It transformed my signature cinnamon rolls into something truly legendary.",
        rating: 5
    },
    {
        id: 2,
        name: "Dr. Aris Fernando",
        role: "Wellness Consultant",
        content: "I recommend Ambrosia to all my clients. Knowing it's 100% authentic Sri Lankan cinnamon gives me peace of mind regarding its health benefits.",
        rating: 5
    },
    {
        id: 3,
        name: "Michael Chen",
        role: "Home Enthusiast",
        content: "I never knew there was such a difference between regular cinnamon and Ceylon cinnamon until I tried the Ravana's Blend. Incredible depth!",
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">What Our Patrons Say</h2>
                    <p className="section-subtitle">Join the community of those who appreciate the finer things in life.</p>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card">
                            <div className="stars">
                                {[...Array(t.rating)].map((_, i) => (
                                    <span key={i} className="star">★</span>
                                ))}
                            </div>
                            <p className="testimonial-content">"{t.content}"</p>
                            <div className="testimonial-author">
                                <div className="author-info">
                                    <h4 className="author-name">{t.name}</h4>
                                    <p className="author-role">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
