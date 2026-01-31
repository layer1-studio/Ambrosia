import React from 'react';
import './Testimonials.css';

const testimonials = [
    {
        id: 1,
        content: "Absolutely the finest cinnamon I have ever used. The difference in aroma and taste compared to store-bought is night and day.",
        rating: 5
    },
    {
        id: 2,
        content: "I was skeptical about premium cinnamon, but this has changed my morning coffee ritual forever. Smooth, sweet, and incredibly fragrant.",
        rating: 5
    },
    {
        id: 3,
        content: "The packaging is beautiful and the product inside is even better. Fast shipping and excellent quality. Truly 100% authentic Ceylon.",
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">What Our Customers Say</h2>
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
                            {/* Anonymous - No Name/Role displayed */}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
