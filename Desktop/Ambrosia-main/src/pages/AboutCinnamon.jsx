import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AboutCinnamon.css';
import './LegalPage.css';

const productionVideo = '/Ambrosia/images/Ceylon_Cinnamon_Production_Video_Generation.mp4';
const gardenImg = '/Ambrosia/images/garden.png';

const milestones = [
    { year: '1824', title: 'The First Harvest', desc: 'Our estate began cultivating true Ceylon cinnamon in the heart of the island.' },
    { year: '1905', title: 'Royal Warrant', desc: 'Recognition of the gold standard, purveying to the most discerning European courts.' },
    { year: '2022', title: 'Global Renaissance', desc: 'Reimagining the spice route to bring the purest Ceylon essence to the modern world.' },
];

const AboutCinnamon = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-cinnamon-page">
            {/* Hero Video Section */}
            <div className="about-video-container">
                <video autoPlay muted loop playsInline>
                    <source src={productionVideo} type="video/mp4" />
                </video>
                <div className="about-video-overlay" />
            </div>

            <div className="container mx-auto px-6">
                <section className="about-content-section">
                    <header className="mb-16">
                        <h1 className="about-title">The Essence of Luxury.</h1>
                        <p className="about-text-content">
                            Beyond the spice rack lies a legacy of kings and explorers. Ceylon Cinnamon (Cinnamomum Verum) is the only "true" cinnamon—known for its delicate complexity, floral sweetness, and profound health benefits.
                        </p>
                    </header>

                    {/* Timeline */}
                    <div className="about-timeline">
                        {milestones.map((m, i) => (
                            <div key={i} className="timeline-item">
                                <div className="timeline-dot" />
                                <span className="timeline-year">{m.year}</span>
                                <h3 className="text-white font-heading text-lg mb-2 uppercase tracking-wider">{m.title}</h3>
                                <p className="timeline-text">{m.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="legal-divider" style={{ margin: '6rem 0' }}>
                        <div className="flourish" />
                    </div>

                    {/* Heritage Image */}
                    <div className="text-center mb-16">
                        <h2 className="text-gold font-heading text-2xl uppercase tracking-[0.2em] mb-8">A Tale of Origin</h2>
                        <div className="about-image-centered">
                            <img src={gardenImg} alt="Ceylon cinnamon heritage estate" />
                        </div>
                        <p className="about-text-content mt-8">
                            For centuries, our heritage has been rooted in the sun-drenched estates of Sri Lanka. Every quill is hand-peeled and sun-dried, preserving the volatile oils that define the world's finest spice.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-8 py-12">
                        <Link to="/shop" className="btn px-10 py-4 text-sm">Explore the Collection</Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutCinnamon;
