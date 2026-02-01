import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Mail, Search, Trash2, Send, AlertCircle, Archive, Check } from 'lucide-react';
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
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

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

    const handleDelete = (id, e) => {
        if (e) e.stopPropagation();
        setDeleteConfirm({ show: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            await deleteDoc(doc(db, 'messages', deleteConfirm.id));
            if (selectedMessage?.id === deleteConfirm.id) setSelectedMessage(null);
            setDeleteConfirm({ show: false, id: null });
        }
    };

    const handleArchive = async (id, e) => {
        if (e) e.stopPropagation();
        await updateDoc(doc(db, 'messages', id), { status: 'archived' });
        if (selectedMessage?.id === id) setSelectedMessage(null);
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
        if (filter === 'all') return matchesSearch && msg.status !== 'archived';
        return matchesSearch;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Inbox...</p>
        </div>
    );

    return (
        <div className="flex flex-col space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl md:text-5xl font-heading text-white tracking-tight mb-2">Messages</h1>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Client Inquiries</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, subject, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 w-full md:w-72 text-sm text-white focus:border-gold outline-none transition-all placeholder:text-gray-500"
                    />
                </div>
            </div>

            <div className="flex flex-1 min-h-[500px] gap-0 bg-[#080808] border border-white/5 rounded-2xl overflow-hidden">
                {/* List View */}
                <div className={`w-full lg:w-[320px] xl:w-[380px] flex flex-col border-r border-white/5 shrink-0 ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-3 flex gap-2 border-b border-white/5">
                        {['all', 'unread'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${filter === f ? 'bg-gold/15 text-gold border border-gold/30' : 'text-gray-500 hover:bg-white/5 border border-transparent'}`}
                            >
                                {f === 'all' ? 'All' : 'Unread'}
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
                                    className={`p-4 md:p-5 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors relative ${selectedMessage?.id === msg.id ? 'bg-gold/[0.08] border-l-2 border-l-gold' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className={`text-sm font-semibold truncate flex-1 ${msg.status === 'new' ? 'text-white' : 'text-gray-400'}`}>{msg.name}</h4>
                                        {msg.status === 'new' && <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5"></span>}
                                        {msg.status === 'replied' && <Check size={14} className="text-green-500 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-gray-300 truncate mb-1">{msg.subject}</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-2">{msg.createdAt.toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reading Pane */}
                <div className={`flex-1 flex flex-col min-w-0 bg-[#050505]/50 lg:bg-transparent absolute inset-0 lg:static z-20 ${selectedMessage ? 'flex' : 'hidden lg:flex'}`}>
                    {selectedMessage ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-white/5 flex flex-wrap justify-between items-start gap-4 bg-white/[0.02]">
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"><AlertCircle className="rotate-180" size={20} /></button>
                                    <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-lg font-heading text-gold shrink-0">
                                        {selectedMessage.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-heading text-white truncate">{selectedMessage.subject}</h2>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedMessage.name} &bull; {selectedMessage.email}</p>
                                        <p className="text-[10px] text-gray-600 mt-1">{selectedMessage.createdAt.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={(e) => handleArchive(selectedMessage.id, e)} className="p-2 hover:bg-white/5 hover:text-gold rounded-lg text-gray-500 transition-colors" title="Archive"><Archive size={18} /></button>
                                    <button onClick={(e) => handleDelete(selectedMessage.id, e)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-500 transition-colors" title="Delete"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm border-l-2 border-gold/30 pl-4">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <div className="p-4 md:p-6 border-t border-white/5 bg-white/[0.02] shrink-0">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Compose your reply..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold/50 outline-none min-h-[120px] resize-none transition-all placeholder:text-gray-500 leading-relaxed mb-3"
                                ></textarea>
                                <button
                                    onClick={handleReply}
                                    disabled={!replyText.trim() || sending}
                                    className="btn-gold !py-2.5 !px-6 rounded-lg flex items-center gap-2 text-xs"
                                >
                                    {sending ? 'Sending...' : <><Send size={14} /> Send Reply</>}
                                </button>
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
            {/* Custom Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm({ show: false, id: null })}></div>
                    <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-in text-center">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-heading text-white mb-2">Delete Thread?</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">This conversation will be permanently removed. Are you sure?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="flex-1 py-3 rounded-xl border border-white/10 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
