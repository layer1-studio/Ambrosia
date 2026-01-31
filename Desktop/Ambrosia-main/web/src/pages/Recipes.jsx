import React from 'react';
import './Recipes.css';
import divineImg from '../assets/images/divine.png';
import gardenImg from '../assets/images/garden.png';

const recipes = [
    {
        id: 1,
        title: "Golden Cinnamon Latte",
        category: "Beverages",
        image: divineImg,
        time: "5 mins",
        desc: "A warm, soul-soothing latte infused with Ambrosia Divine Essence."
    },
    {
        id: 2,
        title: "Authentic Sri Lankan Chai",
        category: "Beverages",
        image: gardenImg,
        time: "15 mins",
        desc: "A spiced tea tradition using whole Kuveni sticks."
    },
    {
        id: 3,
        title: "Cinnamon Glazed Apple Tart",
        category: "Desserts",
        image: divineImg,
        time: "45 mins",
        desc: "A classic dessert elevated by the floral notes of Ceylon cinnamon."
    },
    {
        id: 4,
        title: "Health Benefits of Daily Cinnamon",
        category: "Wellness",
        image: gardenImg,
        time: "4 min read",
        desc: "How a pinch of Ambrosia every morning can change your metabolism."
    }
];

const Recipes = () => {
    return (
        <div className="recipes-page">
            <section className="recipes-hero">
                <div className="container">
                    <h1 className="text-6xl font-heading text-gold mb-4">Recipes & Rituals</h1>
                    <p className="text-xl text-gray-400">Discover the endless possibilities of true cinnamon.</p>
                </div>
            </section>

            <section className="recipes-grid-section py-20">
                <div className="container">
                    <div className="recipes-grid">
                        {recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="recipe-image">
                                    <img src={recipe.image} alt={recipe.title} />
                                    <span className="recipe-cat">{recipe.category}</span>
                                </div>
                                <div className="recipe-info">
                                    <span className="recipe-time">{recipe.time}</span>
                                    <h3 className="recipe-title">{recipe.title}</h3>
                                    <p className="recipe-desc">{recipe.desc}</p>
                                    <button className="read-more">Read More</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Recipes;
