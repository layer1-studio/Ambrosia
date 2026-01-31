import React from 'react';
import { createPortal } from 'react-dom';
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
        desc: "A warm, soul-soothing latte infused with Ambrosia Divine Essence.",
        ingredients: [
            "1 tsp Ambrosia Divine Essence (Ground Cinnamon)",
            "1 cup Milk of choice (Oat or Dairy fits best)",
            "1 tsp Honey or Maple Syrup",
            "A pinch of Turmeric (optional)"
        ],
        instructions: [
            "Warm the milk in a small saucepan over medium heat until steaming.",
            "Whisk in the Ambrosia Cinnamon and sweetener until frothy.",
            "Pour into your favorite mug and dust with a final pinch of gold."
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
            "2 bags of Strong Black Tea",
            "3 Cardamom pods, crushed",
            "1 slice of fresh Ginger",
            "2 cups Water",
            "Milk and Sugar to taste"
        ],
        instructions: [
            "Boil water with cinnamon sticks, cardamom, and ginger for 5 minutes.",
            "Add tea bags and steep for another 3-4 minutes.",
            "Remove tea bags and spices, add milk and sugar, and bring to a simmer.",
            "Strain into cups and enjoy the aroma of Ceylon."
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
            "1 sheet Puff Pastry",
            "3 large Apples, thinly sliced",
            "2 tbsp Melted Butter",
            "3 tbsp Brown Sugar",
            "1 tbsp Ambrosia Cinnamon"
        ],
        instructions: [
            "Preheat oven to 200°C (400°F).",
            "Layer apple slices over the puff pastry sheet.",
            "Mix cinnamon and sugar, then sprinkle over the apples.",
            "Brush with melted butter and bake for 20-25 minutes until golden."
        ]
    },
    {
        id: 4,
        title: "Health Benefits: Wellness Water",
        category: "Wellness",
        image: gardenImg,
        time: "4 min read",
        desc: "How a pinch of Ambrosia every morning can change your metabolism.",
        ingredients: [
            "1 Kuveni Cinnamon Stick",
            "1 liter Filtered Water",
            "Optional: Lemon slice or Mint leaves"
        ],
        instructions: [
            "Place the cinnamon stick in a glass pitcher of water.",
            "Let it infuse overnight in the refrigerator.",
            "Drink throughout the day to help regulate blood sugar and boost metabolism."
        ]
    }
];

const Recipes = () => {
    const [selectedRecipe, setSelectedRecipe] = React.useState(null);

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
                            <div key={recipe.id} className="recipe-card group" onClick={() => setSelectedRecipe(recipe)}>
                                <div className="recipe-image overflow-hidden">
                                    <img src={recipe.image} alt={recipe.title} className="group-hover:scale-110 transition-transform duration-500" />
                                    <span className="recipe-cat">{recipe.category}</span>
                                </div>
                                <div className="recipe-info">
                                    <span className="recipe-time">{recipe.time}</span>
                                    <h3 className="recipe-title group-hover:text-gold transition-colors">{recipe.title}</h3>
                                    <p className="recipe-desc">{recipe.desc}</p>
                                    <button
                                        className="read-more"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRecipe(recipe);
                                        }}
                                    >
                                        Read More →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recipe Detail Modal - Portaled to body for z-index safety */}
            {selectedRecipe && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 max-w-2xl w-full relative transform transition-all duration-300 scale-100 shadow-2xl shadow-gold/10" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-6 text-gray-400 hover:text-white text-3xl transition-colors" onClick={() => setSelectedRecipe(null)}>&times;</button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3">
                                <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full rounded-2xl aspect-square object-cover shadow-lg border border-white/5" />
                            </div>
                            <div className="w-full md:w-2/3">
                                <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">{selectedRecipe.category}</span>
                                <h2 className="text-3xl font-heading text-white mb-2 leading-tight">{selectedRecipe.title}</h2>
                                <p className="text-gold/80 text-sm mb-6 italic border-l-2 border-gold/30 pl-3">{selectedRecipe.desc}</p>

                                <div className="recipe-details space-y-6 text-gray-300 text-sm leading-relaxed max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                    <div>
                                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/10 pb-1">Ingredients</h4>
                                        <ul className="space-y-2">
                                            {selectedRecipe.ingredients.map((ing, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-gold">•</span> {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/10 pb-1">Instructions</h4>
                                        <ol className="space-y-3">
                                            {selectedRecipe.instructions.map((step, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="text-gold font-bold">{idx + 1}.</span> {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button className="bg-gold text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-all duration-300 shadow-lg shadow-gold/20" onClick={() => setSelectedRecipe(null)}>Close Recipe</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Recipes;
