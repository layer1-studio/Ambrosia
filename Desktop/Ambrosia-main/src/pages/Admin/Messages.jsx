import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Mail, Search, Trash2, Reply, Send, User, Clock, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Admin.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setMessages(msgs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg);
        if (msg.status === 'new') {
            await updateDoc(doc(db, 'messages', msg.id), { status: 'read' });
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Purge this intelligence record?')) {
            await deleteDoc(doc(db, 'messages', id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedMessage) return;
        setSending(true);

        try {
            const serviceID = 'service_vnv2zdj';
            const templateID = 'template_bny43aj';
            const publicKey = 'BsB9Xsr8nr5Yo-WuD';

            const templateParams = {
                to_name: selectedMessage.name,
                to_email: selectedMessage.email,
                original_message: selectedMessage.message,
                reply_message: replyText,
                subject: `Re: ${selectedMessage.subject}`
            };

            await emailjs.send(serviceID, templateID, templateParams, publicKey);

            await updateDoc(doc(db, 'messages', selectedMessage.id), {
                status: 'replied',
                repliedAt: new Date()
            });

            alert(`Encrypted response sent to ${selectedMessage.email}`);
            setReplyText('');
        } catch (error) {
            console.error("Failed to send reply:", error);
            alert(`Transmission failed. Error: ${error.text || error.message}`);
        } finally {
            setSending(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'unread') return matchesSearch && msg.status === 'new';
        return matchesSearch;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Intel Feed...</p>
        </div>
    );

    return (
        <div className="min-h-screen lg:h-[calc(100vh-10rem)] flex flex-col space-y-6 md:space-y-8 animate-fade-in pb-20">
            <div className="admin-header flex-row items-end justify-between">
                <div>
                    <h1 className="admin-title">Comms <span className="highlight">Intercept</span></h1>
                    <p className="admin-subtitle opacity-70 mt-2">Secured Network & Client Intelligence Ledger</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Seek Transmission..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-xs text-white focus:outline-none focus:border-gold w-full md:w-72 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-white/[0.01] border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                {/* Side Feed */}
                <div className={`w-full lg:w-[400px] lg:border-r border-white/5 flex flex-col bg-black/40 ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-6 md:p-8 border-b border-white/5 flex gap-4 bg-white/[0.02]">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-3 md:py-4 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border ${filter === 'all' ? 'bg-white text-black border-white shadow-xl' : 'text-gray-500 border-white/5 hover:bg-white/5'}`}
                        >
                            Log: All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-3 md:py-4 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border ${filter === 'unread' ? 'bg-gold text-black border-gold shadow-[0_10px_30px_rgba(212,175,55,0.3)]' : 'text-gray-500 border-white/5 hover:bg-white/5'}`}
                        >
                            Intercepts
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar py-4 min-h-[400px]">
                        {filteredMessages.length === 0 ? (
                            <div className="p-20 text-center opacity-20">
                                <Mail className="w-12 h-12 text-gold mx-auto mb-6" strokeWidth={1} />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">The Aether is Silent</p>
                            </div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={`p-6 md:p-8 cursor-pointer transition-all duration-500 relative group border-b border-white/[0.02] ${selectedMessage?.id === msg.id ? 'bg-gold/[0.03]' : 'hover:bg-white/[0.02]'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-xs font-bold truncate pr-4 transition-colors ${msg.status === 'new' ? 'text-gold' : 'text-gray-400 group-hover:text-white'}`}>
                                            {msg.name}
                                        </h3>
                                        <span className="text-[9px] text-gray-600 font-mono tracking-tighter opacity-60">
                                            {msg.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-[10px] mb-3 truncate uppercase tracking-[0.2em] font-black ${msg.status === 'new' ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>{msg.subject}</p>
                                    <p className="text-[11px] text-gray-500 truncate leading-relaxed italic opacity-60">"{msg.message}"</p>

                                    {msg.status === 'new' && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gold rounded-r-full shadow-[0_0_20px_rgba(212,175,55,0.8)] animate-pulse"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Intelligence Terminal */}
                <div className={`flex-1 flex flex-col bg-black/20 relative ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedMessage ? (
                        <div className="flex-1 flex flex-col animate-slide-in-right h-full overflow-hidden">
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="lg:hidden absolute top-6 left-6 z-20 p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white border border-white/5 transition-all active:scale-95"
                            >
                                <AlertCircle size={18} className="rotate-180" />
                            </button>

                            {/* Signal Headers */}
                            <div className="p-8 md:p-12 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start gap-8 bg-gold/[0.02] backdrop-blur-3xl shrink-0">
                                <div className="flex items-start gap-6 md:gap-8">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-gold/30 via-gold/10 to-transparent border border-gold/20 flex items-center justify-center text-white font-heading text-3xl md:text-4xl shadow-2xl transition-transform duration-700 hover:rotate-6 shrink-0">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-2xl md:text-4xl font-heading text-white mb-3 md:mb-4 tracking-tight truncate">{selectedMessage.subject}</h2>
                                        <div className="flex flex-col gap-2 md:gap-3">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/40">Point of Origin:</span>
                                                <span className="text-xs text-white font-bold tracking-tight">{selectedMessage.name}</span>
                                                <span className="text-[10px] font-mono text-gold/60 border-l border-white/10 pl-4 truncate">{selectedMessage.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-gray-600 uppercase tracking-[0.3em] font-black italic">
                                                <Clock size={12} className="text-gold/40" />
                                                Time-Stamped: {selectedMessage.createdAt.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(selectedMessage.id, e)}
                                    className="btn-ghost !p-4 md:!p-5 !rounded-2xl hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 shadow-xl group self-end sm:self-auto"
                                >
                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            {/* Decrypted Payload */}
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                                <div className="max-w-4xl relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/20 via-gold/5 to-transparent rounded-full"></div>
                                    <p className="text-white/80 leading-loose whitespace-pre-wrap text-base md:text-xl font-medium pl-8 md:pl-12 py-4 italic font-serif">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            {/* Encrypted Relay Protocol */}
                            <div className="p-12 bg-black/60 border-t border-white/5 relative overflow-hidden group/reply">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/reply:bg-gold/10 transition-all duration-1000"></div>
                                <div className="max-w-5xl mx-auto space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-gold/40">Secured Response Gateway</h3>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Synthesize encrypted relay..."
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 text-base text-white focus:border-gold/50 outline-none min-h-[180px] resize-none transition-all placeholder:text-gray-800 font-medium custom-scrollbar shadow-inner"
                                        />
                                        <div className="absolute right-8 bottom-8">
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyText.trim() || sending}
                                                className="btn-gold !px-12 !py-5 !text-[11px] flex items-center gap-4 disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                                            >
                                                {sending ? 'Encrypting...' : <><Send size={16} strokeWidth={3} /> Commit Transmission</>}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-700 italic text-center uppercase tracking-[0.5em] font-black opacity-40">End-to-End Encrypted Relay Protocol Active</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-48 h-48 rounded-[3rem] border border-white/5 flex items-center justify-center mb-10 relative group">
                                <div className="absolute inset-0 rounded-[3rem] border border-gold/10 animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <Mail size={64} className="text-gold/10 group-hover:text-gold/20 transition-colors" strokeWidth={1} />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-gray-700 mb-4 ml-2">Waiting for Signal</h3>
                            <p className="text-[10px] text-gray-800 italic uppercase tracking-widest font-black opacity-40">Select intelligence packet to decrypt</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
