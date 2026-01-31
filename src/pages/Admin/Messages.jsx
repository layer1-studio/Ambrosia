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
        if (window.confirm('Delete this conversation?')) {
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

            alert(`Reply sent to ${selectedMessage.email}`);
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
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Loading Messages...</p>
        </div>
    );

    return (
        <div className="min-h-screen lg:h-[calc(100vh-10rem)] flex flex-col space-y-6 md:space-y-8 animate-fade-in pb-20">
            <div className="admin-header flex-row items-end justify-between">
                <div>
                    <h1 className="admin-title">Message <span className="highlight">Inbox</span></h1>
                    <p className="admin-subtitle opacity-70 mt-2">Customer inquiries and support</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input w-full md:w-72 pl-12"
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
                            className={`filter-btn flex-1 !text-center !px-0 ${filter === 'all' ? 'active' : ''}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`filter-btn flex-1 !text-center !px-0 ${filter === 'unread' ? 'active' : ''}`}
                        >
                            Unread
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar py-4 min-h-[400px]">
                        {filteredMessages.length === 0 ? (
                            <div className="p-20 text-center opacity-20">
                                <Mail className="w-12 h-12 text-gold mx-auto mb-6" strokeWidth={1} />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">No messages found</p>
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
                                className="lg:hidden absolute top-6 left-6 z-20 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white border border-white/5 transition-all active:scale-95"
                            >
                                <AlertCircle size={18} className="rotate-180" />
                            </button>

                            {/* Clean Header */}
                            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-xl font-heading text-gold border border-gold/10">
                                            {selectedMessage.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-heading text-white tracking-tight">{selectedMessage.subject}</h2>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-1">
                                                <span className="text-white font-bold">{selectedMessage.name}</span>
                                                <span>•</span>
                                                <span className="opacity-70">{selectedMessage.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <button
                                            onClick={(e) => handleDelete(selectedMessage.id, e)}
                                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="text-[9px] text-gray-600 font-mono">{selectedMessage.createdAt.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clean content */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                <div className="max-w-3xl">
                                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap font-light">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            {/* Simplified Reply Area */}
                            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                                <div className="flex flex-col gap-4">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-gold/30 outline-none min-h-[120px] resize-none transition-all placeholder:text-gray-700 font-light"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyText.trim() || sending}
                                            className="bg-gold text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gold/20"
                                        >
                                            {sending ? 'Sending...' : <><Send size={14} /> Send Reply</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                            <Mail size={48} className="text-gray-600 mb-4" strokeWidth={1} />
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Select a message</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
