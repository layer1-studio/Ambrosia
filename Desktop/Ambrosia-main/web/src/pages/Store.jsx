import React, { useState } from 'react';
import divineImg from '../assets/images/divine.png';
import kuveniImg from '../assets/images/kuveni.png';
import ravanaImg from '../assets/images/ravana.png';
import { useCart } from '../context/CartContext';
import './Store.css';

const allProducts = [
    {
        id: 1,
        name: "Divine Essence Powder",
        category: "Powder",
        price: 45.00,
        image: divineImg,
        origin: "100% Sri Lankan"
    },
    {
        id: 2,
        name: "Kuveni's Reserve Sticks",
        category: "Sticks",
        price: 60.00,
        image: kuveniImg,
        origin: "100% Sri Lankan"
    },
    {
        id: 3,
        name: "Ravana's Signature Blend",
        category: "Blends",
        price: 55.00,
        image: ravanaImg,
        origin: "100% Sri Lankan"
    },
    {
        id: 4,
        name: "Ambrosia Collection Box",
        category: "Gift Sets",
        price: 120.00,
        image: divineImg,
        origin: "100% Sri Lankan"
    },
    {
        id: 5,
        name: "Alba Grade Premium Sticks",
        category: "Sticks",
        price: 75.00,
        image: kuveniImg,
        origin: "100% Sri Lankan"
    },
    {
        id: 6,
        name: "Culinary Grade Powder",
        category: "Powder",
        price: 30.00,
        image: divineImg,
        origin: "100% Sri Lankan"
    }
];

const Store = () => {
    const { addToCart } = useCart();
    const [filter, setFilter] = useState("All");
    const categories = ["All", "Sticks", "Powder", "Blends", "Gift Sets"];

    const filteredProducts = filter === "All"
        ? allProducts
        : allProducts.filter(p => p.category === filter);

    return (
        <div className="store-page">
            <section className="store-header">
                <div className="container">
                    <h1 className="text-5xl font-heading text-gold mb-4">The Collections</h1>
                    <p className="text-gray-400">Authentic Ceylon cinnamon for every occasion.</p>
                </div>
            </section>

            <section className="store-content py-12">
                <div className="container">
                    <div className="filters-bar mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="store-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="store-item-card">
                                <div className="item-image">
                                    <img src={product.image} alt={product.name} />
                                    <span className="origin-badge">{product.origin}</span>
                                </div>
                                <div className="item-info">
                                    <span className="item-cat">{product.category}</span>
                                    <h3 className="item-name">{product.name}</h3>
                                    <p className="item-price">${product.price.toFixed(2)}</p>
                                    <button onClick={() => addToCart(product)} className="add-cart-btn uppercase">Add to Cart</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Store;
