import React from 'react';
import Hero from '../components/Hero';
import BrandIntro from '../components/BrandIntro';
import Products from '../components/Products';
import RecipesHome from '../components/RecipesHome';
import Testimonials from '../components/Testimonials';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />
            <BrandIntro />
            <Products />
            <RecipesHome />
            <Testimonials />
        </div>
    );
};

export default Home;
