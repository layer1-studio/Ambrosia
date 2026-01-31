import React, { useState, useEffect } from 'react';
import comparisonImg from '../assets/images/comparison.png';
import './AboutCinnamon.css';
import { Link } from 'react-router-dom';

const facts = [
    "Cinnamon bark is harvested after two years of growth during the rainy season.",
    "True Ceylon Cinnamon quills are filled like a cigar with small, fine chips.",
    "In the 1st century AD, 350 grams of cinnamon was worth 5 kilograms of silver.",
    "The word 'Cinnamon' is derived from the Greek 'kinnamon'."
];

const AboutCinnamon = () => {
    const [currentFact, setCurrentFact] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % facts.length);
        }, 5000); // Change fact every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="cinnamon-education-page">
            <section className="edu-hero">
                <div className="container text-center">
                    <span className="gold-label font-bold tracking-widest uppercase mb-4 block">Educational Guide</span>
                    <h1 className="text-7xl font-heading text-gold mb-6">The Gold of the East</h1>
                    <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-10">
                        Deep within the soul of Sri Lanka lies a secret that shaped world history.
                        Worshiped by Emperors and sought by explorers, Ceylon Cinnamon remains
                        nature's most sophisticated spice.
                    </p>
                    <div className="flex justify-center gap-6">
                        <a href="#production-video" className="btn btn-outline">Watch Production</a>
                        <Link to="/shop" className="btn">Shop Collection</Link>
                    </div>
                </div>
            </section>

            <section className="history-section py-24 bg-[#050505]">
                <div className="container">
                    <div className="history-grid grid grid-cols-2 gap-20 items-center">
                        <div className="history-content">
                            <h2 className="text-4xl font-heading text-white mb-8">A Journey Through Time</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                The documented history of Sri Lankan cinnamon dates back over 3,000 years.
                                Mentioned in the Old Testament and sought by Ancient Egyptians for embalming,
                                it was the most prized possession in the ancient world.
                            </p>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                In the 15th century, the 'Cinnamon Quest' launched the Age of Discovery.
                                Columbus, Vasco da Gama, and Magellan sailed into the unknown partially
                                driven by the intoxicating scent of Ceylon’s 'true' cinnamon. For centuries,
                                nations fought wars for the exclusive rights to our island's shores.
                            </p>
                            <blockquote className="border-l-4 border-gold pl-6 py-2 italic text-gray-300 text-lg">
                                "The cinnamon of Ceylon is the best in all the world, and many-a-man
                                hath lost his life for its sake."
                                <span className="block text-sm text-gold mt-2">— 17th Century Dutch Explorer</span>
                            </blockquote>
                        </div>
                        <div className="history-visual relative">
                            <div className="history-box p-12 bg-gold/5 border border-gold/20 rounded-lg">
                                <h3 className="text-2xl text-gold mb-6 font-heading">Key Historical Milestones</h3>
                                <ul className="space-y-6">
                                    <li className="flex gap-4">
                                        <span className="text-gold font-bold">1400 BC:</span>
                                        <p className="text-gray-400 text-sm">Used in Ancient Egypt as a sacred medicinal ingredient.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-gold font-bold">1505 AD:</span>
                                        <p className="text-gray-400 text-sm">Portuguese explorers land in Sri Lanka, seeking the source of 'True Cinnamon'.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-gold font-bold">18th Century:</span>
                                        <p className="text-gray-400 text-sm">Dutch East India Company establishes the first systematic plantations.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="production-video" className="video-section py-24 bg-black">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading text-gold mb-4">Life of Cinnamon</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Witness the meticulous craft behind every Ambrosia quill.</p>
                    </div>
                    {/* Video Placeholder using iframe (YouTube example of Ceylon Cinnamon production) */}
                    <div className="video-container aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden border border-gold/10 shadow-2xl">
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/j_8c8XwK6-o"
                            title="Life of Ceylon Cinnamon"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <p className="text-center text-gray-500 mt-8 italic">Courtesy: A cinematic look at the traditional peeling process in Southern Sri Lanka.</p>
                </div>
            </section>

            <section className="types-section py-24 bg-[#0a0a0a]">
                <div className="container grid grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1">
                        <img src={comparisonImg} alt="Cinnamon Comparison" className="rounded-xl border border-gold/20 shadow-2xl" />
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-4xl font-heading text-white mb-8">Ceylon vs Cassia</h2>
                        <div className="comparison-bullets space-y-8">
                            <div>
                                <h4 className="text-gold mb-2 font-bold tracking-wide">THE TRUTH</h4>
                                <p className="text-gray-400">
                                    Mass-market <strong>Cassia</strong> contains high levels of <em>coumarin</em>,
                                    a compound that can be toxic if consumed regularly. It's thick, hard bark with
                                    a spicy, hot bite.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-gold mb-2 font-bold tracking-wide">THE ESSENCE</h4>
                                <p className="text-gray-400">
                                    <strong>Ambrosia Ceylon Cinnamon</strong> is thin, flaky, and delicate. It has
                                    virtually 0% coumarin and offers a complex, floral sweetness that's safe for
                                    daily health rituals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="uses-section py-24 bg-[#050505]">
                <div className="container">
                    <h2 className="text-4xl font-heading text-gold text-center mb-16">Rituals & Remedies</h2>
                    <div className="grid grid-cols-3 gap-12">
                        <div className="use-card p-10 bg-[#111] rounded-lg border border-white/5">
                            <h3 className="text-xl text-white mb-4">Culinary Mastery</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Used in both sweet and savory dishes. From a pinch in your morning coffee to a quill in
                                a slow-cooked Lankan curry, its versatility is unmatched.
                            </p>
                        </div>
                        <div className="use-card p-10 bg-[#111] rounded-lg border border-white/5 text-center transform scale-110 border-gold/20">
                            <h3 className="text-xl text-white mb-4">Wellness Elixir</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Mixed with warm water and honey for a natural immunity boost. A powerful tool
                                for blood sugar regulation and metabolic health.
                            </p>
                        </div>
                        <div className="use-card p-10 bg-[#111] rounded-lg border border-white/5">
                            <h3 className="text-xl text-white mb-4">Pure Aromatherapy</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Its scent alone can improve memory and mood. Use the natural quills as an elegant,
                                aromatic centerpiece in your living space.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fun-facts py-24 bg-gold/5 overflow-hidden">
                <div className="container text-center">
                    <span className="gold-label text-xs tracking-widest uppercase mb-6 block">Did You Know?</span>
                    <div className="fact-slider">
                        <p className="text-white font-heading text-3xl max-w-4xl mx-auto animate-fade-in" key={currentFact}>
                            {facts[currentFact]}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 mt-8">
                        {facts.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentFact ? 'bg-gold w-8' : 'bg-gray-700'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta-section py-24 text-center">
                <div className="container">
                    <h2 className="text-5xl font-heading text-white mb-10">Experience the Pure Essence</h2>
                    <Link to="/shop" className="btn btn-lg px-12 py-5 text-lg">Shop Ambrosia Cinnamon</Link>
                </div>
            </section>
        </div>
    );
};

export default AboutCinnamon;
