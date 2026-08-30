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
                navigate('/secured-web-ambrosia/admin');
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
        <div className="admin-theme min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <div className="bg-[#0a0a0a] border-2 border-[#1c1a17] p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-lg font-semibold text-[#f2efe9] mb-1">Admin sign in</h1>
                        <p className="text-xs text-[#615c54] uppercase tracking-[0.14em]">Ambrosia Back Office</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#8a857e] mb-1.5 uppercase tracking-[0.12em]">
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
                            <label className="block text-[10px] font-bold text-[#8a857e] mb-1.5 uppercase tracking-[0.12em]">
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
                            className="btn-premium btn-premium-gold w-full justify-center !h-11 text-xs disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center">
                        <Link to="/" className="text-xs text-[#615c54] hover:text-gold transition-colors">
                            ← Back to store
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
