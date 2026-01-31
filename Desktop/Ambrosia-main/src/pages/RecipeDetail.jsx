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
                <h2 className="text-3xl font-heading mb-6 tracking-widest text-gold">Recipe Not Found</h2>
                <Link to="/recipes" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs border-b border-gold/50 pb-1">Return to Collection</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="container text-center">
                        <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                            {recipe.category}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                            {recipe.title}
                        </h1>
                        <div className="flex items-center justify-center gap-8 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gold" />
                                <span className="text-sm font-medium uppercase tracking-widest">{recipe.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-6 -mt-20 relative z-10 pb-32">
                <button
                    onClick={() => navigate('/recipes')}
                    className="absolute -top-32 left-0 text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs font-bold transition-colors"
                >
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="bg-[#0f0f0f] border border-white/5 p-8 md:p-16 shadow-2xl animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl text-white font-heading text-center italic leading-relaxed mb-16">
                            "{recipe.desc}"
                        </p>

                        <div className="grid md:grid-cols-12 gap-16">
                            {/* Ingredients Column */}
                            <div className="md:col-span-5 relative">
                                <div className="sticky top-32">
                                    <h3 className="text-2xl font-heading text-gold mb-8">Ingredients</h3>
                                    <ul className="space-y-4 font-light text-sm tracking-wide">
                                        {recipe.ingredients.map((ing, idx) => (
                                            <li key={idx} className="flex gap-4 items-start py-3 border-b border-dashed border-white/10 last:border-0">
                                                <span className="text-gold mt-1">✦</span>
                                                <span className="leading-relaxed">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Divider Line (Mobile Only) */}
                            <div className="md:hidden h-px bg-white/10 my-4"></div>

                            {/* Instructions Column */}
                            <div className="md:col-span-7">
                                <h3 className="text-2xl font-heading text-gold mb-8">Preparation</h3>
                                <div className="space-y-12">
                                    {recipe.instructions.map((step, idx) => (
                                        <div key={idx} className="relative pl-8 group">
                                            <span className="absolute left-0 top-0 text-3xl font-heading text-white/10 group-hover:text-gold/20 transition-colors">
                                                {idx + 1}
                                            </span>
                                            <p className="text-gray-300 leading-loose">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-20 pt-8 border-t border-white/5 flex gap-6">
                                    <button className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500 hover:text-gold transition-colors">
                                        <Share2 size={16} /> Share Recipe
                                    </button>
                                    <button className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500 hover:text-gold transition-colors">
                                        <Printer size={16} /> Print Card
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
