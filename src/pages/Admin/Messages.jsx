import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Mail, Send, Trash2, Archive, Check, User, MoreVertical, PenSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Admin.css';

// --- EmailJS Configuration ---
// Update these with your live credentials from https://www.emailjs.com/
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_vnv2zdj',
    TEMPLATE_ID: 'template_bny43aj',
    PUBLIC_KEY: 'BsB9Xsr8nr5Yo-WuD'
};

const Messages = () => {
    console.log("[Messages] Component Loaded - Build 1.1");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all'); // all, new, archived

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()
                };
            }));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg);
        if (msg.status === 'new') {
            try {
                await updateDoc(doc(db, "messages", msg.id), { status: 'read' });
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };


    const handleDelete = async (id, e) => {
        e?.stopPropagation();
        if (window.confirm("Permanently purge this correspondence?")) {
            try {
                await deleteDoc(doc(db, "messages", id));
                if (selectedMessage?.id === id) setSelectedMessage(null);
            } catch (error) {
                alert("Error deleting message: " + error.message);
            }
        }
    };

    const handleArchive = async (id, e) => {
        e?.stopPropagation();
        try {
            await updateDoc(doc(db, "messages", id), { status: 'archived' });
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            alert("Error archiving message: " + error.message);
        }
    };

    const filteredMessages = messages.filter(msg => {
        let matchesStatus = true;
        if (statusFilter === 'new') matchesStatus = msg.status === 'new' || msg.status === 'read';
        if (statusFilter === 'archived') matchesStatus = msg.status === 'archived';
        return matchesStatus;
    });

    const unreadCount = messages.filter(m => m.status === 'new').length;
    const archivedCount = messages.filter(m => m.status === 'archived').length;

    const openReplyModal = () => setReplyModalOpen(true);
    const closeReplyModal = () => {
        setReplyModalOpen(false);
        setReplyText('');
    };
    const handleReplySubmit = async () => {
        if (!replyText.trim() || !selectedMessage) return;
        setSending(true);

        const emailParams = {
            to_name: selectedMessage.name?.trim() || 'Valued Customer',
            to_email: selectedMessage.email?.trim(),
            reply_message: replyText.trim(),
            original_message: selectedMessage.message?.trim() || 'No original message content available.',
            subject: `Re: ${selectedMessage.subject || 'Your inquiry'}`
        };

        console.log('[EmailJS Debug] Preparing to send payload:', emailParams);

        try {
            const result = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams,
                EMAILJS_CONFIG.PUBLIC_KEY
            );
            console.log('[EmailJS Debug] Success result:', result);

            await updateDoc(doc(db, "messages", selectedMessage.id), {
                status: 'replied',
                reply: replyText,
                repliedAt: Timestamp.now()
            });

            setReplyText('');
            closeReplyModal();
        } catch (err) {
            console.error('[EmailJS Debug] Error sending email:', err);
            alert('Failed to send reply: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-reveal min-h-0">
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Column 1: FILTERS */}
                <aside className="w-[200px] shrink-0 h-full flex flex-col border-r border-white/10 pr-4">
                    <h2 className="admin-section-title text-gold font-heading mb-4">FILTERS</h2>
                    <div className="space-y-1">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'new', label: 'Unread', badge: unreadCount },
                            { id: 'archived', label: 'Archived', badge: archivedCount },
                        ].map(({ id, label, badge }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setStatusFilter(id)}
                                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${statusFilter === id ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
                            >
                                <span>{label}</span>
                                {badge !== undefined && (
                                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">{badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Column 2: INBOX */}
                <div className="w-[320px] lg:w-[380px] shrink-0 h-full flex flex-col border-r border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <h2 className="admin-section-title text-gold font-heading mb-0">INBOX</h2>
                        <button type="button" className="btn-premium btn-premium-gold !py-2 !px-4 text-xs font-bold rounded-xl">
                            <PenSquare size={14} />
                            New Message
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)
                        ) : filteredMessages.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">No messages</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-gold/10 border border-gold/20' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gold truncate">{msg.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{msg.message?.slice(0, 40)}...</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-gray-500">{msg.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                            {msg.status === 'new' && <span className="w-4 h-4 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">1</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Column 3: MESSAGE */}
                <div className={`flex-1 flex flex-col min-w-0 glass-panel rounded-2xl border border-white/5 overflow-hidden ${!selectedMessage ? 'hidden lg:flex items-center justify-center' : ''}`}>
                    {selectedMessage ? (
                        <>
                            <div className="p-6 border-b border-white/5 flex justify-between items-start shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-heading text-xl shrink-0">
                                        {selectedMessage.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-gold font-semibold">{selectedMessage.name}</p>
                                        <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                                        <a href="#contact-details" className="text-xs text-gold hover:underline mt-0.5 inline-block">Contact - Details</a>
                                    </div>
                                </div>
                                <button type="button" onClick={(e) => handleDelete(selectedMessage.id, e)} className="p-2 text-gray-500 hover:text-white rounded-lg" aria-label="More options">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>
                            <div className="p-6 border-t border-white/5 bg-white/[0.01] shrink-0">
                                <div className="space-y-6">
                                    {selectedMessage.reply && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                                                <Check size={14} strokeWidth={3} />
                                                LATEST DISPATCHED REPLY
                                            </div>
                                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-gray-400 text-sm italic leading-relaxed">
                                                "{selectedMessage.reply}"
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={openReplyModal}
                                        className="btn-premium btn-premium-gold font-bold rounded-xl px-8 py-3"
                                    >
                                        {selectedMessage.reply ? 'REPLY AGAIN' : 'REPLY TO MESSAGE'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 text-gold">
                                <Mail size={28} />
                            </div>
                            <p className="text-gray-500 text-sm">Select a message</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal - wireframe: recipient, subject, textarea, Discard, Send Reply */}
            {replyModalOpen && selectedMessage && (
                <div className="admin-modal-overlay" onClick={closeReplyModal}>
                    <div className="admin-modal-content p-6 md:p-8 rounded-2xl border border-gold/20 shadow-2xl max-w-lg w-full animate-reveal" onClick={e => e.stopPropagation()}>
                        <div className="mb-6">
                            <p className="text-xl font-heading font-bold text-gold">{selectedMessage.name}</p>
                            <p className="text-sm text-gold/90 mt-0.5">Re: {selectedMessage.subject}</p>
                        </div>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your message..."
                            className="admin-input w-full min-h-[200px] resize-none rounded-xl bg-white/[0.04] border-gold/20 text-white placeholder:text-gray-500"
                            autoFocus
                        />
                        <div className="flex items-center justify-between gap-4 mt-6">
                            <button type="button" onClick={closeReplyModal} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <Trash2 size={18} />
                                Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim() || sending}
                                className="btn-send-reply flex items-center gap-2 disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : <>Send Reply</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
