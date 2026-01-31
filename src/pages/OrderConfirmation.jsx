import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const orderId = location.state?.orderId || 'AMB-' + Math.floor(100000 + Math.random() * 900000);

    return (
        <div className="confirmation-page py-48">
            <div className="container text-center">
                <div className="success-icon text-gold text-7xl mb-8">✓</div>
                <h1 className="text-6xl font-heading text-gold mb-6">Order Confirmed</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
                    Thank you for choosing Ambrosia. We have received your request and are meticulously preparing
                    your selection for its journey to you.
                </p>
                <div className="order-details-summary bg-[#111] p-10 rounded max-w-lg mx-auto border border-white/5 mb-16">
                    <p className="text-gray-500 text-sm mb-4">Order #{orderId}</p>
                    <p className="text-white">A confirmation communiqué has been dispatched. You may track your delivery once the parcel is en route.</p>
                </div>
                <div className="flex justify-center gap-8">
                    <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
                    <Link to="/" className="btn">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
