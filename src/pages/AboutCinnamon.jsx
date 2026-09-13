import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AboutCinnamon.css';
import './LegalPage.css';
import './AboutUs.css';

const productionVideo = '/Ambrosia/images/cinnamon-shoot.mp4';
const topoGold = '/Ambrosia/images/topo_gold.svg';

const AboutCinnamon = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        // The `autoplay` attribute alone is unreliable (Safari in particular
        // will silently fall back to showing a paused play button). Kick
        // playback off explicitly once the element exists.
        const video = videoRef.current;
        if (video) {
            const tryPlay = () => video.play().catch(() => { });
            tryPlay();
            video.addEventListener('canplay', tryPlay);
            return () => video.removeEventListener('canplay', tryPlay);
        }
    }, []);

    return (
        <div className="about-cinnamon-page">
            {/* Hero Video Section */}
            <div className="about-video-container">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onPause={(e) => e.currentTarget.play().catch(() => { })}
                >
                    <source src={productionVideo} type="video/mp4" />
                </video>
                <div className="about-video-overlay" />
            </div>

            <section className="origin-section" style={{ '--topo-url': `url(${topoGold})` }}>
                <div className="container origin-container">
                    <span className="gold-label">The Story of Ceylon Cinnamon</span>
                    <h2 className="origin-title">The Tale of Origin</h2>
                    <div className="origin-divider"><span></span><i></i><span></span></div>

                    <p className="origin-p">
                        Long before the world drew its maps, it had already found its way to one island. Sri Lanka —
                        once known as Lanka Deepa, the resplendent isle — is the birthplace of true Ceylon cinnamon,
                        <em> Cinnamomum verum</em>, the only cinnamon the ancient world considered worthy of kings and gods.
                    </p>
                    <p className="origin-p">
                        Egyptian pharaohs sought it for sacred rites. Roman emperors paid for it in gold. For centuries,
                        traders guarded the secret of its source so fiercely that legends grew in its place — tales of spice
                        harvested from the nests of great birds, in lands no man could reach. When the truth emerged,
                        empires crossed oceans for it. The Portuguese, the Dutch, and the British each came to Ceylon
                        drawn by a single spice: bark hand-rolled into golden quills, delicate and sweet where all other
                        cinnamon is harsh.
                    </p>
                    <p className="origin-p">
                        That craft has never left the island. In the deep south, where monsoon rains meet ancient soils,
                        peelers still work as their forebears did — coaxing paper-thin layers from the cinnamon tree and
                        rolling them, by hand, into the fine quills the world knows as true Ceylon cinnamon.
                    </p>
                    <p className="origin-p">
                        Beyond the spice rack lies a legacy of kings and explorers. Ceylon Cinnamon (Cinnamomum Verum) is
                        the only "true" cinnamon—known for its delicate complexity, floral sweetness, and profound health benefits.
                    </p>
                </div>
            </section>

            <section className="mission-section py-20">
                <div className="container intro-grid">
                    <div className="mission-text">
                        <span className="gold-label">Pure Ceylon Cinnamon</span>
                        <h2 className="text-4xl font-heading mb-8">The Ambrosia Way</h2>
                        <p className="mb-6 leading-relaxed">
                            At Ambrosia Ceylon, we honour this inheritance. Our cinnamon is single-origin, harvested
                            from the southern hills of Sri Lanka and hand-selected to Alba grade — the rarest and finest
                            expression of Ceylon cinnamon, slender as a whisper, pale as dawn. Nothing added, nothing disguised.
                        </p>
                        <p className="mb-6 leading-relaxed">
                            Each expression in our collection carries a name drawn from Lankan legend —
                            <Link to="/shop"> Kuveni's Reserve</Link>, <Link to="/shop">Ravana's Blend</Link>, and{' '}
                            <Link to="/shop">Divine Essence</Link> — because this spice was never merely a commodity.
                            It was tribute, medicine, and ritual. We craft it for the same slow moments today: warm milk
                            at dusk, the quiet luxury of things done properly.
                        </p>
                        <p className="origin-signoff">From our island to your table — the golden spice, as it was always meant to be.</p>
                    </div>
                    <div className="mission-image">
                        <img src="/Ambrosia/images/garden.png" alt="Ambrosia Ceylon cinnamon garden" className="rounded-lg shadow-2xl" />
                    </div>
                </div>
            </section>

            <section className="sourcing-section py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading mb-4 sourcing-heading">Ethical Cultivation</h2>
                        <p className="max-w-2xl mx-auto sourcing-lede">We operate on a cycle of respect — for the soil, the artisan, and the connoisseur.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-16 items-center">
                        <div className="sourcing-content">
                            <h3 className="text-2xl mb-6 sourcing-heading">Harvested from Wild Gardens</h3>
                            <p className="mb-6 sourcing-text">
                                Unlike industrial plantations, our cinnamon is sourced from 'wild gardens' where
                                biodiversity thrives. This natural ecosystem allows the trees to develop
                                higher concentrations of essential oils, resulting in the signature floral aroma
                                unique to Ambrosia.
                            </p>
                            <p className="sourcing-text">
                                Every harvest is traceable to its village of origin, ensuring that the local
                                communities guarding this heritage are fairly compensated and supported.
                            </p>
                        </div>
                        <div className="sourcing-stats grid grid-cols-2 gap-8">
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">100%</span>
                                <p className="sourcing-text">Organic Origin</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">500+</span>
                                <p className="sourcing-text">Artisan Farmers</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">0%</span>
                                <p className="sourcing-text">Additives</p>
                            </div>
                            <div className="stat-box">
                                <span className="text-4xl text-gold font-bold">True</span>
                                <p className="sourcing-text">Alba Grade</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col items-center gap-8" style={{ background: 'var(--color-cream-soft)', padding: '4rem 0' }}>
                <Link to="/shop" className="btn px-10 py-4 text-sm">Explore the Collection</Link>
            </div>
        </div>
    );
};

export default AboutCinnamon;
