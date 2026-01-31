import React from 'react';
import divineImg from '../assets/images/divine.png';
import kuveniImg from '../assets/images/kuveni.png';
import ravanaImg from '../assets/images/ravana.png';
import { useCart } from '../context/CartContext';
import './Products.css';

const products = [
    {
        id: 1,
        name: "Divine Essence Powder",
        price: 45.00,
        image: divineImg,
        description: "Finely milled 100% Sri Lankan cinnamon powder for effortless blending."
    },
    {
        id: 2,
        name: "Kuveni's Reserve Sticks",
        price: 60.00,
        image: kuveniImg,
        description: "Hand-rolled Alba grade Ceylon cinnamon sticks, the gold standard."
    },
    {
        id: 3,
        name: "Ravana's Signature Blend",
        price: 55.00,
        image: ravanaImg,
        description: "A specialized infusion of spices anchored by our premium cinnamon."
    }
];

const Products = () => {
    const { addToCart } = useCart();

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
                                <img src={product.image} alt={product.name} className="product-image" />
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-desc">{product.description}</p>
                                <span className="product-price">${product.price.toFixed(2)}</span>
                                <button onClick={() => addToCart(product)} className="product-btn uppercase">Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
