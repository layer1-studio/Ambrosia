import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Admin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data()?.role === 'admin') {
                navigate('/admin');
            } else {
                await signOut(auth);
                throw new Error("Access Denied: You do not have administrator privileges.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            const errorMessage = err.message.includes("Access Denied")
                ? err.message
                : "Invalid credentials. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Subtle ambient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-10 shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-heading text-white mb-1">Admin Sign In</h1>
                        <p className="text-sm text-gray-500">Ambrosia Back Office</p>
                    </div>

                    {error && (
                        <div
                            className={`mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm ${error ? 'animate-shake' : ''}`}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="admin-input"
                                placeholder="admin@ambrosia.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="admin-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gold !py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gold transition-colors">
                            ← Back to store
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
