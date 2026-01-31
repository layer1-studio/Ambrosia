import React from 'react';

const PlaceholderPage = ({ title }) => (
    <div className="section" style={{ paddingTop: '150px', minHeight: '80vh' }}>
        <div className="container text-center">
            <h1 className="text-6xl text-gold mb-8">{title}</h1>
            <p className="text-xl text-gray-500">This section is coming soon as part of the Ambrosia mission.</p>
        </div>
    </div>
);

export const Cart = () => <PlaceholderPage title="Your Selection" />;
export const ProductDetail = () => <PlaceholderPage title="Product Details" />;
export const PrivacyPolicy = () => <PlaceholderPage title="Privacy Policy" />;
export const Terms = () => <PlaceholderPage title="Terms & Conditions" />;
