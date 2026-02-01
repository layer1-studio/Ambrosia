import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Mail, Search, Trash2, Send, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Admin.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
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
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Inbox...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-fade-in pb-4">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h1 className="text-6xl md:text-7xl font-heading text-white tracking-tighter mb-4">Inbox</h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Client Inquiries</p>
                </div>
                <div className="relative group hidden md:block">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-b border-white/10 py-2 pl-6 pr-4 w-64 text-sm text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-mono"
                    />
                </div>
            </div>

            <div className="flex flex-1 gap-8 min-h-0 bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* List View */}
                <div className={`w-full lg:w-[400px] flex flex-col border-r border-white/5 bg-white/[0.01] ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 flex gap-4 border-b border-white/5">
                        {['all', 'unread'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${filter === f ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredMessages.length === 0 ? (
                            <div className="p-10 text-center opacity-30 text-[10px] uppercase tracking-widest">No Messages</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={`p-8 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors relative group ${selectedMessage?.id === msg.id ? 'bg-gold/[0.05]' : ''}`}
                                >
                                    {msg.status === 'new' && <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_#D4AF37]"></div>}
                                    <h4 className={`text-sm font-bold mb-1 ${msg.status === 'new' ? 'text-white' : 'text-gray-400'}`}>{msg.name}</h4>
                                    <p className="text-xs text-white mb-2 truncate font-heading tracking-wide">{msg.subject}</p>
                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed opacity-70">{msg.message}</p>
                                    <p className="text-[9px] text-gray-700 font-mono mt-4 uppercase">{msg.createdAt.toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reading Pane */}
                <div className={`flex-1 flex flex-col bg-black/40 backdrop-blur-xl absolute inset-0 lg:static z-20 ${selectedMessage ? 'flex animate-slide-in-right' : 'hidden lg:flex'}`}>
                    {selectedMessage ? (
                        <>
                            <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/[0.01]">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 -ml-2 text-gray-400"><AlertCircle className="rotate-180" /></button>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-transparent border border-gold/10 flex items-center justify-center text-xl font-heading text-gold">
                                        {selectedMessage.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-heading text-white">{selectedMessage.subject}</h2>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 font-mono uppercase">
                                            <span>{selectedMessage.name}</span>
                                            <span className="text-gold/50">•</span>
                                            <span>{selectedMessage.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-gray-600 font-mono">{selectedMessage.createdAt.toLocaleString()}</span>
                                    <button onClick={(e) => handleDelete(selectedMessage.id, e)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-600"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                                <div className="max-w-3xl mx-auto">
                                    <p className="text-gray-300 font-light leading-loose whitespace-pre-wrap text-sm border-l-2 border-gold/20 pl-6">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                                <div className="max-w-3xl mx-auto space-y-4">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Compose your reply..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm text-white focus:bg-white/[0.05] focus:border-gold/50 focus:shadow-[0_0_30px_rgba(212,175,55,0.1)] outline-none min-h-[160px] resize-none transition-all placeholder:text-gray-600 font-light leading-relaxed"
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyText.trim() || sending}
                                            className="btn-gold !py-3 !px-8 rounded-lg"
                                        >
                                            {sending ? 'Transmitting...' : <><Send size={14} className="mr-2" /> Send Reply</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                            <Mail size={48} strokeWidth={1} />
                            <p className="text-[10px] uppercase tracking-[0.3em] mt-4 font-bold">Select a thread</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
