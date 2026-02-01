import React from 'react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import './Recipes.css';

const Recipes = () => {
    return (
        <div className="recipes-page">
            <section className="recipes-hero">
                <div className="container">
                    <h1 className="text-6xl font-heading text-gold mb-4">Recipes & Rites</h1>
                    <p className="text-xl text-gray-400">Elevate your craft with the finest spice known to man.</p>
                </div>
            </section>

            <section className="recipes-grid-section py-20">
                <div className="container">
                    <div className="recipes-grid">
                        {recipes.map(recipe => (
                            <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="recipe-card group block">
                                <div className="recipe-image overflow-hidden">
                                    <img src={recipe.image} alt={recipe.title} className="group-hover:scale-110 transition-transform duration-500" />
                                    <span className="recipe-cat">{recipe.category}</span>
                                </div>
                                <div className="recipe-info">
                                    <span className="recipe-time">{recipe.time}</span>
                                    <h3 className="recipe-title group-hover:text-gold transition-colors">{recipe.title}</h3>
                                    <p className="recipe-desc">{recipe.desc}</p>
                                    <span className="read-more">Read More →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Recipes;
