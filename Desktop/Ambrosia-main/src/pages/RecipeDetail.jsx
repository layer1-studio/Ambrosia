import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { ArrowLeft, Clock, Share2, Printer } from 'lucide-react';
import './Recipes.css'; // Reusing styles

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const recipe = recipes.find(r => r.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!recipe) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-heading mb-4">Recipe Not Found</h2>
                <Link to="/recipes" className="text-gold underline">Return to Recipes</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
            <div className="container max-w-4xl mx-auto px-6">
                <button
                    onClick={() => navigate('/recipes')}
                    className="flex items-center gap-2 text-gold/60 hover:text-gold mb-8 transition-colors text-sm uppercase tracking-widest font-bold"
                >
                    <ArrowLeft size={16} /> Back to Recipes
                </button>

                <div className="bg-[#111] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
                    {/* Hero Image */}
                    <div className="h-[400px] w-full relative">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <span className="bg-gold text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">
                                {recipe.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-heading text-white mb-4 shadow-black drop-shadow-lg">{recipe.title}</h1>
                            <div className="flex items-center gap-6 text-gray-300 text-sm">
                                <span className="flex items-center gap-2"><Clock size={16} className="text-gold" /> {recipe.time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <p className="text-xl text-gold/80 italic font-heading mb-12 border-l-2 border-gold/30 pl-6 leading-relaxed">
                            "{recipe.desc}"
                        </p>

                        <div className="grid md:grid-cols-12 gap-12">
                            {/* Ingredients */}
                            <div className="md:col-span-5">
                                <h3 className="text-white font-bold uppercase tracking-[0.2em] text-sm mb-6 pb-2 border-b border-white/10 flex items-center gap-3">
                                    <span className="text-gold text-lg">●</span> Ingredients
                                </h3>
                                <ul className="space-y-4">
                                    {recipe.ingredients.map((ing, idx) => (
                                        <li key={idx} className="flex gap-4 items-start text-gray-300 text-sm leading-relaxed group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-2 group-hover:bg-gold transition-colors"></div>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="md:col-span-7">
                                <h3 className="text-white font-bold uppercase tracking-[0.2em] text-sm mb-6 pb-2 border-b border-white/10 flex items-center gap-3">
                                    <span className="text-gold text-lg">type</span> Preparation
                                </h3>
                                <div className="space-y-8">
                                    {recipe.instructions.map((step, idx) => (
                                        <div key={idx} className="flex gap-6 group">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center text-gold font-bold text-sm group-hover:bg-gold group-hover:text-black transition-all">
                                                {idx + 1}
                                            </div>
                                            <p className="text-gray-300 text-sm leading-7 pt-1 group-hover:text-white transition-colors">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t border-white/5 flex gap-4 justify-end">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all">
                                <Share2 size={16} /> Share
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all">
                                <Printer size={16} /> Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
