import React from 'react';
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
    return (
        <div className="faq-page">
            <section className="faq-hero py-20">
                <div className="container text-center">
                    <h1 className="text-5xl font-heading text-gold mb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-400">Everything you need to know about Ambrosia.</p>
                </div>
            </section>

            <section className="faq-list-section py-12">
                <div className="container max-w-3xl">
                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <div key={i} className="faq-item mb-8">
                                <h3 className="text-xl text-white mb-3 font-heading">{faq.q}</h3>
                                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
