import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { ArrowLeft, Clock, Share2, Printer } from 'lucide-react';
import './Recipes.css';

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
                <h2 className="text-3xl font-heading mb-6 tracking-widest text-gold text-center">Recipe Not Found</h2>
                <Link to="/recipes" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs border-b border-gold/50 pb-1">Return to Collection</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans pb-20">
            {/* Hero Section */}
            <div className="relative h-[50vh] w-full">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0a0a0a]"></div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 flex flex-col items-center text-center">
                    <span className="bg-gold/20 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md mb-6 border border-gold/20">
                        {recipe.category}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-heading text-white mb-6 drop-shadow-2xl">
                        {recipe.title}
                    </h1>
                    <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[#d4af37]">
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{recipe.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-6 relative z-10">
                <button
                    onClick={() => navigate('/recipes')}
                    className="mb-8 text-gray-500 hover:text-gold flex items-center gap-2 uppercase tracking-widest text-xs font-bold transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Collection
                </button>

                <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl">
                    <p className="text-xl md:text-2xl text-white/90 font-heading text-center italic leading-relaxed mb-16 border-b border-white/5 pb-10 max-w-2xl mx-auto">
                        "{recipe.desc}"
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 md:gap-24">
                        {/* Ingredients */}
                        <div>
                            <h3 className="text-xl font-heading text-gold mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-gold/50"></span> Ingredients
                            </h3>
                            <ul className="space-y-4">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex gap-4 items-start text-sm md:text-base leading-relaxed p-3 rounded-lg hover:bg-white/5 transition-colors">
                                        <span className="text-gold mt-1.5 text-xs">●</span>
                                        <span className="text-gray-300">{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h3 className="text-xl font-heading text-gold mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-gold/50"></span> Preparation
                            </h3>
                            <div className="space-y-8">
                                {recipe.instructions.map((step, idx) => (
                                    <div key={idx} className="flex gap-5 group">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold font-heading text-sm group-hover:bg-gold group-hover:text-black transition-all mt-1">
                                            {idx + 1}
                                        </div>
                                        <p className="text-gray-300 leading-7 text-sm md:text-base group-hover:text-white transition-colors">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-white/5 flex gap-4 justify-center md:justify-end">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-gold hover:text-black text-gray-400 text-xs font-bold uppercase tracking-widest transition-all">
                            <Share2 size={14} /> Share
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-gold hover:text-black text-gray-400 text-xs font-bold uppercase tracking-widest transition-all">
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
