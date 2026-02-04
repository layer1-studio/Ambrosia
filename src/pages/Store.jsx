import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import './Store.css';

// Fallback images if DB doesn't have them
import divineImg from '../assets/images/divine.png';
import kuveniImg from '../assets/images/kuveni.png';
import ravanaImg from '../assets/images/ravana.png';

const Store = () => {
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("featured");
    const [filter, setFilter] = useState("All");
    const categories = ["All", "Sticks", "Powder", "Blends", "Gift Sets"];

    useEffect(() => {
        // Real-time listener for products
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Priority: 1. imageUrl (Firebase Storage) 2. Legacy imageType map 3. Fallback
                let displayImage = data.imageUrl;
                if (!displayImage) {
                    displayImage = data.imageType === 'divine' ? divineImg :
                        data.imageType === 'kuveni' ? kuveniImg :
                            data.imageType === 'ravana' ? ravanaImg : divineImg;
                }

                return {
                    id: doc.id,
                    ...data,
                    image: displayImage
                };
            });
            setProducts(productData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredProducts = products
        .filter(p => filter === "All" || p.category === filter)
        .filter(p => (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'price-asc') return Number(a.price) - Number(b.price);
            if (sortOrder === 'price-desc') return Number(b.price) - Number(a.price);
            return 0; // Featured (default order)
        });

    console.log("Store Render Debug:", { productsCount: products.length, filteredCount: filteredProducts.length, loading });

    if (loading) return <div className="text-center py-20 text-gold">Loading Collection...</div>;

    return (
        <div className="store-page">
            <section className="store-header">
                <div className="container">
                    <h1 className="text-5xl font-heading text-gold mb-4">The Ambrosia Collection</h1>
                    <p className="text-gray-400">Purveyors of the world's finest authentic Ceylon Cinnamon.</p>
                </div>
            </section>

            <section className="store-content py-12">
                <div className="container">
                    <div className="filters-bar mb-12 flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="categories flex gap-4 overflow-x-auto pb-4 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`filter-btn whitespace-nowrap ${filter === cat ? 'active' : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="search-sort flex flex-row gap-4 w-full lg:w-auto">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input-premium-dark flex-grow lg:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="input-premium-dark cursor-pointer min-w-[140px]"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="featured" className="bg-black text-white">Featured</option>
                                <option value="price-asc" className="bg-black text-white">Price: Low to High</option>
                                <option value="price-desc" className="bg-black text-white">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="store-grid">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-500 py-20">
                                No products found in this category.
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const isOutOfStock = product.stock <= 0;
                                return (
                                    <div key={product.id} className={`store-item-card ${isOutOfStock ? 'opacity-75 grayscale' : ''}`}>
                                        <div className="item-image relative">
                                            <img src={product.image} alt={product.name} />
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-red-500 font-bold uppercase tracking-widest border border-red-500 px-4 py-2">Sold Out</span>
                                                </div>
                                            )}
                                            {!isOutOfStock && product.stock < 10 && (
                                                <span className="absolute top-2 right-2 bg-yellow-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                    Low Stock: {product.stock}
                                                </span>
                                            )}
                                            <span className="origin-badge">{product.origin || "100% Sri Lankan"}</span>
                                        </div>
                                        <div className="item-info">
                                            <span className="item-cat">{product.category}</span>
                                            <h3 className="item-name">{product.name}</h3>
                                            <div className="flex justify-between items-center w-full mb-4">
                                                <p className="item-price">{formatPrice(product.price)}</p>
                                                <span className="text-xs text-gray-500">{product.unit || 'per unit'}</span>
                                            </div>
                                            <button
                                                onClick={() => !isOutOfStock && addToCart(product)}
                                                disabled={isOutOfStock}
                                                className={`add-cart-btn uppercase w-full ${isOutOfStock ? 'cursor-not-allowed bg-gray-800 text-gray-500 hover:bg-gray-800' : ''}`}
                                            >
                                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Store;
