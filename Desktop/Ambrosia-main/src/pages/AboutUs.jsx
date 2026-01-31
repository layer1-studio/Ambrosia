import React from 'react';
import gardenImg from '../assets/images/garden.png';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1 className="text-6xl font-heading text-gold mb-4">Our Heritage</h1>
                    <p className="text-xl text-gray-300 max-w-2xl">Preserving the 100% authentic legacy of Ceylon Cinnamon.</p>
                </div>
            </section>

            <section className="mission-section py-20">
                <div className="container intro-grid">
                    <div className="mission-text">
                        <h2 className="text-4xl font-heading text-white mb-8">A Legacy of Excellence</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Ambrosia was founded on a singular realization: the true essence of Sri Lankan cinnamon
                            was being lost to the world. In an era dominated by mass-market Cassia, the legendary
                            'Cinnamomum Verum' of Ceylon—once more valuable than gold—had become a rare luxury.
                        </p>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Our journey began in the southern coastal stretches of Sri Lanka, where the humid air
                            and salty breeze create the perfect cradle for the world's finest cinnamon. We don't
                            just sell a spice; we protect a thousand-year-old tradition of hand-peeling and air-drying
                            that has been passed down through generations of 'Salagama' harvesters.
                        </p>
                    </div>
                    <div className="mission-image">
                        <img src={gardenImg} alt="Cinnamon Garden" className="rounded-lg shadow-2xl" />
                    </div>
                </div>
            </section>

            <section className="sourcing-section py-20 bg-gold/5">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading text-gold mb-4">Sustainable Sourcing</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">We believe in a cycle of respect—for the soil, the farmer, and the consumer.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-16 items-center">
                        <div className="sourcing-content">
                            <h3 className="text-2xl text-white mb-6">Direct from the Wild Gardens</h3>
                            <p className="text-gray-500 mb-6">
                                Unlike industrial plantations, our cinnamon is sourced from 'wild gardens' where
                                biodiversity is encouraged. This natural ecosystem allows the trees to develop
                                higher concentrations of essential oils, resulting in the signature floral aroma
                                unique to Ambrosia.
                            </p>
                            <p className="text-gray-500">
                                Every harvest is traceable to its village of origin, ensuring that the local
                                communities that have guarded this heritage for centuries are fairly compensated
                                and supported.
                            </p>
                        </div>
                        <div className="sourcing-stats grid grid-cols-2 gap-8">
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">100%</span>
                                <p className="text-gray-400">Natural & Organic</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">500+</span>
                                <p className="text-gray-400">Local Farmers</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">0%</span>
                                <p className="text-gray-400">Chemical Additives</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">True</span>
                                <p className="text-gray-400">Alba Grade Only</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default AboutUs;
