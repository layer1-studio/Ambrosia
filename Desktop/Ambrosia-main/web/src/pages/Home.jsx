import React from 'react';
import Hero from '../components/Hero';
import BrandIntro from '../components/BrandIntro';
import Products from '../components/Products';
import Testimonials from '../components/Testimonials';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />
            <BrandIntro />
            <Products />
            <Testimonials />
        </div>
    );
};

export default Home;
