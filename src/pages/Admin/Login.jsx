import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gold/[0.02] blur-[150px] rounded-full"></div>
            </div>

            <div className="w-full max-w-sm bg-[#111]/60 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-600 rounded-2xl flex items-center justify-center text-black font-bold text-3xl shadow-2xl shadow-gold/20 mx-auto mb-6 transform hover:rotate-12 transition-transform duration-500">
                        A
                    </div>
                    <h1 className="text-3xl font-heading text-white mb-2 tracking-tight">Ambrosia Portal</h1>
                    <p className="text-gold/50 text-[10px] uppercase tracking-[0.4em] font-semibold">Security Clearance Required</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-[11px] text-center font-medium animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="relative group">
                        <label className="absolute -top-3 left-4 bg-[#111] px-2 text-[10px] uppercase tracking-widest text-gold font-bold z-20">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-800 text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all duration-300 group-hover:border-white/20"
                            placeholder="admin@ambrosia.com"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <label className="absolute -top-3 left-4 bg-[#111] px-2 text-[10px] uppercase tracking-widest text-gold font-bold z-20">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-800 text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all duration-300 group-hover:border-white/20"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gold text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Verifying Access...' : 'Enter Restricted Area'}
                    </button>
                </form>

                <div className="mt-12 text-center opacity-30">
                    <p className="text-[9px] text-gray-400 font-mono tracking-tighter">
                        RSA DIRECT ACCESS KEY REQUIRED // ENCRYPTED SESSION
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
