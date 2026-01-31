import { db } from '../firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import './Products.css';
import { Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

const Products = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, "products"), limit(5));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Fallback logic for images
                    let displayImage = data.imageUrl;
                    if (!displayImage) {
                        const baseUrl = import.meta.env.BASE_URL;
                        displayImage = data.imageType === 'divine' ? `${baseUrl}images/divine.png` :
                            data.imageType === 'kuveni' ? `${baseUrl}images/kuveni.png` :
                                data.imageType === 'ravana' ? `${baseUrl}images/ravana.png` : `${baseUrl}images/divine.png`;
                    }
                    return {
                        id: doc.id,
                        ...data,
                        image: displayImage
                    };
                });
                // Filter out products without names or prices if any
                const validProducts = productsData.filter(p => p.name && p.price);
                setProducts(validProducts);
            } catch (error) {
                console.error("Error fetching home products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return null; // Or a spinner/skeleton

    return (
        <section id="products" className="products-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Royal Collections</h2>
                    <p className="section-subtitle">Curated from the ancient gardens of Ceylon.</p>
                </div>

                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-image-wrapper">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="product-image" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-desc line-clamp-2">{product.description || product.category || "Premium Cinnamon Product"}</p>
                                <span className="product-price">${Number(product.price).toFixed(2)}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={Number(product.stock) === 0}
                                    className={`product-btn uppercase ${Number(product.stock) === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
