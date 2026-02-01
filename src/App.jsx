import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import AboutCinnamon from './pages/AboutCinnamon';
import Store from './pages/Store';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import OrderConfirmation from './pages/OrderConfirmation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminLogin from './pages/Admin/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Orders from './pages/Admin/Orders';
import Products from './pages/Admin/Products';
import Messages from './pages/Admin/Messages';
import Customers from './pages/Admin/Customers';
import Analytics from './pages/Admin/Analytics';
import Settings from './pages/Admin/Settings';
import SidebarDemo from './pages/Admin/SidebarDemo';
import './App.css';

const PublicLayout = () => (
    <>
        <Navbar />
        <main>
            <Outlet />
        </main>
        <Footer />
    </>
);

function App() {
    console.log("VERSION CHECK: HASH ROUTER FIX V4 - PATH OBFUSCATION");
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="app">
                        <Routes>
                            {/* Admin Routes - No Public Navbar/Footer */}
                            <Route path="/secured-web-ambrosia/demo" element={<SidebarDemo />} />
                            <Route path="/secured-web-ambrosia/login" element={<AdminLogin />} />
                            <Route path="/secured-web-ambrosia/admin" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="products" element={<Products />} />
                                <Route path="messages" element={<Messages />} />
                                <Route path="customers" element={<Customers />} />
                                <Route path="analytics" element={<Analytics />} />
                                <Route path="settings" element={<Settings />} />
                            </Route>

                            {/* Public Routes - With Navbar/Footer Layout */}
                            <Route path="/" element={<PublicLayout />}>
                                <Route index element={<Home />} />
                                <Route path="about-us" element={<AboutUs />} />
                                <Route path="about-cinnamon" element={<AboutCinnamon />} />
                                <Route path="shop" element={<Store />} />
                                <Route path="recipes" element={<Recipes />} />
                                <Route path="recipes/:id" element={<RecipeDetail />} />
                                <Route path="contact" element={<Contact />} />
                                <Route path="cart" element={<Cart />} />
                                <Route path="checkout" element={<Checkout />} />
                                <Route path="track" element={<TrackOrder />} />
                                <Route path="order-confirmation" element={<OrderConfirmation />} />
                                <Route path="faq" element={<FAQ />} />
                                <Route path="privacy" element={<PrivacyPolicy />} />
                                <Route path="terms" element={<Terms />} />
                            </Route>
                        </Routes>
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
