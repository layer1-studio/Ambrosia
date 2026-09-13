import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { productDetails } from '../data/productDetails';
import './ProductDetail.css';

// Extra gallery angles for products that have more than one product shot.
const EXTRA_IMAGES = {
    'ravana-blend': ['ravana-blend-2.jpg']
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setQuantity(1);
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const resolveImage = (data, docId) => {
        const baseUrl = import.meta.env.BASE_URL;
        if (data.imageUrl) return data.imageUrl;
        if (data.imageType) {
            const map = {
                divine: `${baseUrl}images/divine.png`,
                kuveni: `${baseUrl}images/kuveni.png`,
                ravana: `${baseUrl}images/ravana.png`
            };
            if (map[data.imageType]) return map[data.imageType];
        }
        return `${baseUrl}images/${docId}.jpg`;
    };

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const snap = await getDoc(doc(db, 'products', id));
            if (snap.exists()) {
                const data = snap.data();
                const mainImage = resolveImage(data, snap.id);
                const baseUrl = import.meta.env.BASE_URL;
                const gallery = [mainImage, ...(EXTRA_IMAGES[snap.id] || []).map(f => `${baseUrl}images/${f}`)];
                setProduct({ id: snap.id, ...data, image: mainImage, gallery });
                setActiveImage(mainImage);
            } else {
                setProduct(null);
            }

            const allSnap = await getDocs(collection(db, 'products'));
            const others = allSnap.docs
                .filter(d => d.id !== id)
                .map(d => {
                    const data = d.data();
                    return { id: d.id, ...data, image: resolveImage(data, d.id) };
                });
            setRelated(others);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="pd-loading">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-heading mb-6 tracking-widest text-gold text-center">Product Not Found</h2>
                <Link to="/shop" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs border-b border-gold/50 pb-1">Return to the Boutique</Link>
            </div>
        );
    }

    const isOutOfStock = Number(product.stock) <= 0;
    const displayCategory = product.category === 'Sticks' ? 'Quills' : product.category;
    const details = productDetails[product.id];

    return (
        <div className="product-detail-page">
            <div className="pd-wrapper">
                <button onClick={() => navigate('/shop')} className="back-link-top">
                    <ArrowLeft size={14} /> Back to the Boutique
                </button>

                <div className="pd-grid">
                    <div className="pd-image-col">
                        <div className="pd-image-frame">
                            <img src={activeImage || product.image} alt={product.name} />
                            <span className="pd-origin-badge">{product.origin || '100% Sri Lankan'}</span>
                        </div>
                        {product.gallery.length > 1 && (
                            <div className="pd-thumb-row">
                                {product.gallery.map((src, idx) => (
                                    <button
                                        key={src}
                                        className={`pd-thumb ${activeImage === src ? 'active' : ''}`}
                                        onClick={() => setActiveImage(src)}
                                        aria-label={`View image ${idx + 1}`}
                                    >
                                        <img src={src} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pd-info-col">
                        {displayCategory && <span className="pd-category">{displayCategory}</span>}
                        <h1 className="pd-title">{product.name}</h1>
                        {details?.tagline && <p className="pd-tagline">{details.tagline}</p>}
                        <div className="pd-price-row">
                            <span className="pd-price">{formatPrice(product.price)}</span>
                            <span className="pd-unit">{product.unit || 'per unit'}</span>
                        </div>

                        <p className="pd-description">{product.description || details?.story || 'The finest grade Ceylon Cinnamon, crafted with reverence for a thousand-year-old tradition.'}</p>

                        {isOutOfStock ? (
                            <div className="pd-out-of-stock">Currently Sold Out</div>
                        ) : (
                            <>
                                {Number(product.stock) < 10 && (
                                    <p className="pd-low-stock">Only {product.stock} left</p>
                                )}
                                <div className="pd-purchase-row">
                                    <div className="pd-qty">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(Number(product.stock) || 99, q + 1))} aria-label="Increase quantity"><Plus size={14} /></button>
                                    </div>
                                    <button
                                        className="pd-add-btn"
                                        onClick={() => {
                                            for (let i = 0; i < quantity; i++) addToCart(product);
                                        }}
                                    >
                                        <ShoppingBag size={16} /> Add to Cart
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {details && (
                    <div className="pd-facts-grid">
                        <div className="pd-facts-section">
                            <div className="pd-section-header">
                                <h3>Product Details</h3>
                                <div className="pd-section-line"></div>
                            </div>
                            <dl className="pd-spec-list">
                                {Object.entries(details.specs).map(([label, value]) => (
                                    <div key={label} className="pd-spec-row">
                                        <dt>{label}</dt>
                                        <dd>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="pd-facts-section">
                            <div className="pd-section-header">
                                <h3>How to Use</h3>
                                <div className="pd-section-line"></div>
                            </div>
                            <ul className="pd-usage-list">
                                {details.usage.map((tip, idx) => (
                                    <li key={idx}>
                                        <span className="pd-usage-bullet">●</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {related.length > 0 && (
                    <div className="pd-related-section">
                        <div className="pd-section-header">
                            <h3>You May Also Like</h3>
                            <div className="pd-section-line"></div>
                        </div>
                        <div className="pd-related-grid">
                            {related.map(r => (
                                <Link to={`/shop/${r.id}`} key={r.id} className="pd-related-card">
                                    <div className="pd-related-image">
                                        <img src={r.image} alt={r.name} />
                                    </div>
                                    <div className="pd-related-info">
                                        <h4>{r.name}</h4>
                                        <span>{formatPrice(r.price)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
