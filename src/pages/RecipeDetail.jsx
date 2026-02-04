import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowLeft, Clock, Share2, Printer, ShoppingBag, Plus } from 'lucide-react';
import './RecipeDetail.css';

// Fallback images if DB doesn't have them
import divineImg from '../assets/images/divine.png';
import kuveniImg from '../assets/images/kuveni.png';
import ravanaImg from '../assets/images/ravana.png';
import gardenImg from '../assets/images/garden.png';

const IMAGE_MAP = {
    'divine': divineImg,
    'kuveni': kuveniImg,
    'ravana': ravanaImg,
    'garden': gardenImg
};

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    const recipe = recipes.find(r => r.id === parseInt(id));
    const [relatedProduct, setRelatedProduct] = React.useState(null);
    const [fetchingProduct, setFetchingProduct] = React.useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (recipe && recipe.relatedProductType) {
            fetchRelatedProduct();
        }
    }, [recipe]);

    const fetchRelatedProduct = async () => {
        setFetchingProduct(true);
        try {
            const q = query(
                collection(db, "products"),
                where("imageType", "==", recipe.relatedProductType),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                setRelatedProduct({
                    id: doc.id,
                    ...data,
                    image: data.imageUrl || IMAGE_MAP[data.imageType] || IMAGE_MAP.divine
                });
            }
        } catch (error) {
            console.error("Error fetching related product:", error);
        } finally {
            setFetchingProduct(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const shareData = {
            title: `Ambrosia Ritual: ${recipe.title}`,
            text: `Discover the ritual of ${recipe.title} from Ambrosia.`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Connection copied to clipboard! Share the ritual.');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (!recipe) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-heading mb-6 tracking-widest text-gold text-center">Ritual Not Found</h2>
                <Link to="/recipes" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs border-b border-gold/50 pb-1">Return to Collection</Link>
            </div>
        );
    }

    return (
        <div className="recipe-detail-page">
            {/* Hero Section */}
            <div className="recipe-hero">
                <img src={recipe.image} alt={recipe.title} className="recipe-hero-img" />
                <div className="recipe-hero-overlay"></div>

                <div className="recipe-hero-content">
                    <span className="recipe-cat-badge">
                        {recipe.category}
                    </span>
                    <h1 className="recipe-main-title">
                        {recipe.title}
                    </h1>
                    <div className="recipe-meta">
                        <div className="recipe-meta-item">
                            <Clock size={16} />
                            <span>{recipe.time} Preparation</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="recipe-content-wrapper">
                <button
                    onClick={() => navigate('/recipes')}
                    className="back-link-top"
                >
                    <ArrowLeft size={14} /> Back to Collection
                </button>

                <div className="recipe-card-glass">
                    <p className="recipe-quote">
                        "{recipe.desc}"
                    </p>

                    <div className="recipe-grid">
                        {/* Ingredients */}
                        <div className="recipe-section">
                            <div className="section-header">
                                <h3 className="section-title">Ingredients</h3>
                                <div className="section-line"></div>
                            </div>
                            <ul className="ingredients-list">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="ingredient-item">
                                        <span className="ingredient-bullet">●</span>
                                        <span>{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div className="recipe-section">
                            <div className="section-header">
                                <h3 className="section-title">Preparation Ritual</h3>
                                <div className="section-line"></div>
                            </div>
                            <div className="instructions-list">
                                {recipe.instructions.map((step, idx) => (
                                    <div key={idx} className="step-item">
                                        <div className="step-number">
                                            {idx + 1}
                                        </div>
                                        <p className="step-text">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="recipe-actions">
                        <button className="action-btn" onClick={handleShare}>
                            <Share2 size={14} /> Share
                        </button>
                        <button className="action-btn" onClick={handlePrint}>
                            <Printer size={14} /> Print
                        </button>
                    </div>

                    {/* Related Product Section */}
                    {relatedProduct && (
                        <div className="related-product-section">
                            <div className="section-header">
                                <h3 className="section-title">The Sovereign Spice</h3>
                                <div className="section-line"></div>
                            </div>
                            <div className="related-product-card">
                                <div className="rp-image">
                                    <img src={relatedProduct.image} alt={relatedProduct.name} />
                                </div>
                                <div className="rp-info">
                                    <span className="rp-label">Essential for this Ritual</span>
                                    <h4>{relatedProduct.name}</h4>
                                    <p>{relatedProduct.description || "The finest grade Ceylon Cinnamon, essential for achieving the divine profile of this ritual."}</p>
                                    <div className="rp-price-action">
                                        <span className="rp-price">{formatPrice(relatedProduct.price)}</span>
                                        <button
                                            className="rp-add-btn"
                                            onClick={() => addToCart(relatedProduct)}
                                        >
                                            <ShoppingBag size={16} />
                                            Acquire Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
