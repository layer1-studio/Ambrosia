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
    const [selectedRecipe, setSelectedRecipe] = React.useState(null);

    return (
        <section className="recipes-home-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Recipes & Rituals</h2>
                    <p className="section-subtitle">Discover the endless possibilities of true cinnamon.</p>
                </div>

                <div className="recipes-home-scroll">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-home-card cursor-pointer group" onClick={() => setSelectedRecipe(recipe)}>
                            <div className="recipe-home-image overflow-hidden">
                                <img src={recipe.image} alt={recipe.title} className="group-hover:scale-110 transition-transform duration-500" />
                                <span className="recipe-home-cat">{recipe.category}</span>
                            </div>
                            <div className="recipe-home-info">
                                <span className="recipe-home-time">{recipe.time}</span>
                                <h3 className="recipe-home-title group-hover:text-gold transition-colors">{recipe.title}</h3>
                                <p className="recipe-home-desc">{recipe.desc}</p>
                                <button className="recipe-home-link bg-transparent border-0 cursor-pointer p-0">Read More</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recipe Detail Modal for Home Page */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-6 text-gray-400 hover:text-white text-3xl" onClick={() => setSelectedRecipe(null)}>&times;</button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3">
                                <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full rounded-2xl aspect-square object-cover" />
                            </div>
                            <div className="w-full md:w-2/3">
                                <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">{selectedRecipe.category}</span>
                                <h2 className="text-3xl font-heading text-white mb-2">{selectedRecipe.title}</h2>
                                <p className="text-gold text-sm mb-6 italic">{selectedRecipe.desc}</p>

                                <div className="recipe-details space-y-6 text-gray-300 text-sm leading-relaxed max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar">
                                    <div>
                                        <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-2 border-b border-white/10 pb-1">Ingredients</h4>
                                        <ul className="space-y-1">
                                            {selectedRecipe.ingredients.map((ing, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-gold">•</span> {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-2 border-b border-white/10 pb-1">Steps</h4>
                                        <ol className="space-y-2">
                                            {selectedRecipe.instructions.map((step, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="text-gold font-bold">{idx + 1}.</span> {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button className="bg-gold text-black px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-gold/10" onClick={() => setSelectedRecipe(null)}>Close</button>
                                    <Link to="/recipes" className="border border-white/20 text-white px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-center">View All</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default RecipesHome;
