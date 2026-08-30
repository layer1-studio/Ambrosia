import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Mail, Check, Archive, Trash2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Admin.css';

// --- EmailJS Configuration ---
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_vnv2zdj',
    TEMPLATE_ID: 'template_bny43aj',
    PUBLIC_KEY: 'BsB9Xsr8nr5Yo-WuD'
};

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
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
        setReplyText('');
        if (msg.status === 'new') {
            try {
                await updateDoc(doc(db, "messages", msg.id), { status: 'read' });
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedMessage) return;
        if (window.confirm("Delete this message permanently?")) {
            try {
                await deleteDoc(doc(db, "messages", selectedMessage.id));
                setSelectedMessage(null);
            } catch (error) {
                alert("Error deleting message: " + error.message);
            }
        }
    };

    const handleArchive = async () => {
        if (!selectedMessage) return;
        try {
            await updateDoc(doc(db, "messages", selectedMessage.id), { status: 'archived' });
            setSelectedMessage(null);
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

        try {
            await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams,
                EMAILJS_CONFIG.PUBLIC_KEY
            );

            await updateDoc(doc(db, "messages", selectedMessage.id), {
                status: 'replied',
                reply: replyText,
                repliedAt: Timestamp.now()
            });

            setSelectedMessage(prev => prev ? { ...prev, status: 'replied', reply: replyText } : prev);
            setReplyText('');
        } catch (err) {
            alert('Failed to send reply: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'All', count: messages.length },
        { id: 'new', label: 'Unread', count: unreadCount },
        { id: 'archived', label: 'Archived', count: archivedCount },
    ];

    return (
        <div className="grid" style={{ gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 64px)' }}>
            {/* Inbox column */}
            <div className="border-r-2 border-[#1c1a17] min-w-0 flex flex-col">
                <div className="h-11 border-b-2 border-[#1c1a17] flex items-center px-5">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setStatusFilter(t.id)}
                            className={`admin-pill ${statusFilter === t.id ? 'active' : ''}`}
                            style={{ height: 44 }}
                        >
                            {t.label}
                            <span className="pill-count">{t.count}</span>
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-5 text-[#615c54] text-sm">Loading…</div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-[#615c54] text-sm">No messages</div>
                    ) : (
                        filteredMessages.map(msg => {
                            const unread = msg.status === 'new';
                            const active = selectedMessage?.id === msg.id;
                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className="px-5 py-3.5 border-b border-[#141311] cursor-pointer"
                                    style={{
                                        borderLeft: `2px solid ${unread ? '#d9d6ba' : 'transparent'}`,
                                        background: active ? 'rgba(217, 214, 186,.08)' : unread ? 'rgba(217, 214, 186,.06)' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className={`text-[13px] truncate ${unread ? 'font-semibold text-[#f2efe9]' : 'font-medium text-[#8a857e]'}`}>{msg.name}</span>
                                        <span className="font-mono text-[10px] text-[#615c54] shrink-0">{msg.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="m-0 mt-1 text-xs text-[#615c54] leading-relaxed truncate">{msg.message?.slice(0, 60)}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Thread column */}
            <div className="min-w-0 flex flex-col">
                {selectedMessage ? (
                    <>
                        <div className="px-8 py-6 border-b-2 border-[#1c1a17] flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="m-0 text-base font-semibold text-[#f2efe9]">{selectedMessage.name}</p>
                                <p className="m-0 mt-1 text-xs text-[#8a857e]">{selectedMessage.email}{selectedMessage.phone ? ` · ${selectedMessage.phone}` : ''}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button type="button" onClick={handleArchive} className="h-[30px] px-3 flex items-center gap-1.5 bg-transparent border border-[#1c1a17] text-[#8a857e] text-[10px] font-bold uppercase tracking-[0.14em] hover:text-white hover:border-[#3a352d] transition-colors">
                                    <Archive size={12} /> Archive
                                </button>
                                <button type="button" onClick={handleDelete} className="h-[30px] px-3 flex items-center gap-1.5 bg-transparent border border-[#1c1a17] text-[#8a857e] text-[10px] font-bold uppercase tracking-[0.14em] hover:text-red-400 hover:border-red-400/40 transition-colors">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 px-8 py-7 max-w-[680px] overflow-y-auto">
                            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">
                                Received {selectedMessage.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                {selectedMessage.subject ? ` · Subject: ${selectedMessage.subject}` : ''}
                            </span>
                            <p className="mt-4 text-sm leading-relaxed text-[#c9c4bb] whitespace-pre-wrap">{selectedMessage.message}</p>

                            {selectedMessage.reply && (
                                <div className="mt-8">
                                    <div className="flex items-center gap-2 text-[#34d399] text-[10px] font-bold uppercase tracking-[0.14em] mb-2.5">
                                        <Check size={13} strokeWidth={3} />
                                        Latest dispatched reply
                                    </div>
                                    <p className="m-0 text-sm text-[#8a857e] italic leading-relaxed">"{selectedMessage.reply}"</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-[#1c1a17] px-8 py-6">
                            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#615c54]">{selectedMessage.reply ? 'Reply again' : 'Reply'}</span>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply…"
                                className="mt-3 block w-full max-w-[680px] min-h-[96px] resize-y bg-[#0a0a0a] border border-[#1c1a17] text-[#f2efe9] text-[13px] leading-relaxed p-3 outline-none focus:border-gold/50"
                            />
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleReplySubmit}
                                    disabled={!replyText.trim() || sending}
                                    className="btn-send-reply disabled:opacity-40"
                                >
                                    {sending ? 'Sending…' : 'Send reply'}
                                </button>
                                <button type="button" onClick={() => setReplyText('')} className="h-[34px] px-4 bg-transparent border border-[#1c1a17] text-[#8a857e] text-[10px] font-bold uppercase tracking-[0.14em] hover:text-white hover:border-[#3a352d] transition-colors">
                                    Discard
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                        <div>
                            <Mail size={28} className="mx-auto mb-3 text-[#4a463f]" />
                            <p className="text-[#615c54] text-sm">Select a message</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
