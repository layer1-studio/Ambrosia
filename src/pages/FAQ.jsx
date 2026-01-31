import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
    {
        q: "Why is Sri Lankan cinnamon better?",
        a: "Sri Lankan (Ceylon) cinnamon has a much lower coumarin content compared to Cassia. It's also known for its delicate, sweet flavor and floral aroma that Cassia lacks."
    },
    {
        q: "How should I store my Ambrosia cinnamon?",
        a: "Store in a cool, dark place in an airtight container. Our premium jars are designed to protect the essential oils from light and moisture."
    },
    {
        q: "Do you ship internationally?",
        a: "Yes, Ambrosia ships to most countries worldwide. Shipping times vary depending on the location, typically 5-10 business days."
    },
    {
        q: "Is your cinnamon organic?",
        a: "We work with farms that follow sustainable, natural farming practices. While not all are certified 'Organic' yet, we ensure no synthetic pesticides or fertilizers are used."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = React.useState(0);

    return (
        <div className="faq-page">
            <section className="faq-hero">
                <div className="container text-center">
                    <span className="faq-eyebrow">Support Center</span>
                    <h1 className="font-heading text-gold">Frequently Asked Questions</h1>
                    <p className="faq-hero-desc">
                        Everything you need to know about our products, shipping, and heritage.
                    </p>
                </div>
            </section>

            <section className="faq-list-section">
                <div className="container max-w-3xl">
                    <div className="space-y-0">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`faq-card ${openIndex === i ? 'open' : ''}`}
                            >
                                <button
                                    type="button"
                                    className="faq-question focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                                    aria-expanded={openIndex === i}
                                    aria-controls={`faq-answer-${i}`}
                                    id={`faq-question-${i}`}
                                >
                                    <h3>{faq.q}</h3>
                                    <span className="faq-chevron" aria-hidden>
                                        <ChevronDown size={20} strokeWidth={2} />
                                    </span>
                                </button>

                                <div
                                    id={`faq-answer-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${i}`}
                                    className="faq-answer-wrapper"
                                    style={{
                                        maxHeight: openIndex === i ? '300px' : '0',
                                        opacity: openIndex === i ? 1 : 0
                                    }}
                                >
                                    <div className="faq-answer-content">
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="faq-cta">
                        <p>Still have questions?</p>
                        <Link to="/contact" className="btn">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
