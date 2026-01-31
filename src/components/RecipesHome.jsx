import React from 'react';
import divineImg from '../assets/images/divine.png';
import gardenImg from '../assets/images/garden.png';
import './RecipesHome.css';
import { Link } from 'react-router-dom';

const recipes = [
    {
        id: 1,
        title: "Golden Cinnamon Latte",
        category: "Beverages",
        image: divineImg,
        time: "5 mins",
        desc: "A warm, soul-soothing latte infused with Ambrosia Divine Essence.",
        ingredients: [
            "1 tsp Ambrosia Divine Essence",
            "1 cup Milk of choice",
            "1 tsp Honey or Maple Syrup"
        ],
        instructions: [
            "Warm the milk until steaming.",
            "Whisk in cinnamon and sweetener until frothy.",
            "Dust with a final pinch and serve."
        ]
    },
    {
        id: 2,
        title: "Authentic Sri Lankan Chai",
        category: "Beverages",
        image: gardenImg,
        time: "15 mins",
        desc: "A spiced tea tradition using whole Kuveni sticks.",
        ingredients: [
            "2 Kuveni Cinnamon Sticks",
            "2 bags Black Tea",
            "3 Cardamom pods",
            "Milk and Sugar"
        ],
        instructions: [
            "Boil water with cinnamon and cardamom for 5 mins.",
            "Steep tea bags for 3 mins.",
            "Add milk and sugar, simmer, strain and serve."
        ]
    },
    {
        id: 3,
        title: "Cinnamon Glazed Apple Tart",
        category: "Desserts",
        image: divineImg,
        time: "45 mins",
        desc: "A classic dessert elevated by the floral notes of Ceylon cinnamon.",
        ingredients: [
            "Puff Pastry sheet",
            "3 sliced Apples",
            "1 tbsp Ambrosia Cinnamon",
            "3 tbsp Brown Sugar"
        ],
        instructions: [
            "Layer apples on pastry.",
            "Sprinkle cinnamon-sugar mix.",
            "Bake at 200°C for 22 minutes until golden."
        ]
    },
    {
        id: 4,
        title: "Wellness Water",
        category: "Wellness",
        image: gardenImg,
        time: "4 min read",
        desc: "How a pinch of Ambrosia every morning can change your metabolism.",
        ingredients: [
            "1 Kuveni Cinnamon Stick",
            "1 liter Filtered Water",
            "Mint leaves"
        ],
        instructions: [
            "Place cinnamon in water pitcher.",
            "Infuse overnight in the fridge.",
            "Drink cold to regulate blood sugar."
        ]
    }
];

const RecipesHome = () => {
    return (
        <section className="recipes-home-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Recipes & Rituals</h2>
                    <p className="section-subtitle">Discover the endless possibilities of true cinnamon.</p>
                </div>

                <div className="recipes-home-scroll">
                    {recipes.map((recipe) => (
                        <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="recipe-home-card cursor-pointer group block">
                            <div className="recipe-home-image overflow-hidden">
                                <img src={recipe.image} alt={recipe.title} className="group-hover:scale-110 transition-transform duration-500" />
                                <span className="recipe-home-cat">{recipe.category}</span>
                            </div>
                            <div className="recipe-home-info">
                                <span className="recipe-home-time">{recipe.time}</span>
                                <h3 className="recipe-home-title group-hover:text-gold transition-colors">{recipe.title}</h3>
                                <p className="recipe-home-desc">{recipe.desc}</p>
                                <Link to="/recipes" className="recipe-home-link bg-transparent border-0 cursor-pointer p-0 inline-block text-gold/80 italic text-xs mt-2 group-hover:text-gold group-hover:translate-x-1 transition-all">Read More →</Link>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecipesHome;
