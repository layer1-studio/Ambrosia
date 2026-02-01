import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Search, Edit2, Trash2, AlertTriangle, DollarSign, Package, Image as ImageIcon, Check, MoreVertical, Filter } from 'lucide-react';
import './Admin.css';

const IMAGE_MAP = {
    'divine': '/Ambrosia/images/divine.png',
    'kuveni': '/Ambrosia/images/kuveni.png',
    'ravana': '/Ambrosia/images/ravana.png',
    'garden': '/Ambrosia/images/garden.png'
};

const CATEGORIES = ['Powder', 'Sticks', 'Blends', 'Gift Sets', 'Limited Edition', 'Skin Care', 'Hair Care', 'Wellness', 'Sets'];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [activeCategory, setActiveCategory] = useState('All');

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        cost: '',
        category: 'Skin Care',
        description: '',
        image: null,
        imageType: 'divine',
        stock: '0',
        reorderPoint: '10',
        featured: false
    });

    const currentProduct = products.find(p => p.id === currentProductId) || null;

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentProductId && currentProduct) {
            setFormData({
                sku: currentProduct.sku || '',
                name: currentProduct.name || '',
                price: currentProduct.price || '',
                cost: currentProduct.cost || '',
                category: currentProduct.category || 'Skin Care',
                description: currentProduct.description || '',
                image: currentProduct.image || currentProduct.imageUrl || null,
                imageType: currentProduct.imageType || 'divine',
                stock: currentProduct.stock || '0',
                reorderPoint: currentProduct.reorderPoint || '10',
                featured: currentProduct.featured || false
            });
        }
    }, [currentProductId, currentProduct]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                const storageRef = ref(storage, `products/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setFormData(prev => ({ ...prev, image: url, imageType: '' }));
            } catch (error) {
                alert("Upload failed: " + error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price),
            cost: Number(formData.cost),
            stock: Number(formData.stock),
            reorderPoint: Number(formData.reorderPoint)
        };
        try {
            if (currentProductId) {
                await updateDoc(doc(db, "products", currentProductId), payload);
            } else {
                await addDoc(collection(db, "products"), payload);
            }
            setIsModalOpen(false);
            setCurrentProductId(null);
        } catch (error) {
            alert("Error saving product: " + error.message);
        }
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            await deleteDoc(doc(db, "products", deleteConfirm.id));
            setDeleteConfirm({ show: false, id: null });
            setIsModalOpen(false);
            setCurrentProductId(null);
        }
    };

    const stats = {
        totalCost: products.reduce((sum, i) => sum + ((Number(i.cost) || 0) * (Number(i.stock) || 0)), 0),
        retailVal: products.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.stock) || 0)), 0),
        lowStock: products.filter(i => (Number(i.stock) || 0) <= (Number(i.reorderPoint) || 10)).length
    };

    const getStockInfo = (item) => {
        const stock = Number(item.stock) || 0;
        const point = Number(item.reorderPoint) || 10;
        if (stock === 0) return { label: "Out of Stock", color: 'danger' };
        if (stock <= point) return { label: "Low Stock", color: 'warning' };
        return { label: "Fully Stocked", color: 'success' };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 animate-reveal">
            {/* Top bar - wireframe: Search, Category dropdown, ADD PRODUCT */}
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-10">
                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input w-full pl-11 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:border-gold/50"
                        />
                    </div>
                    <div className="relative w-48 shrink-0">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="admin-input w-full pl-11 pr-10 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl appearance-none cursor-pointer focus:border-gold/50"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => { setCurrentProductId(null); setFormData({ sku: '', name: '', price: '', cost: '', category: 'Skin Care', description: '', image: null, imageType: 'divine', stock: '0', reorderPoint: '10', featured: false }); setIsModalOpen(true); }}
                    className="btn-premium btn-premium-gold whitespace-nowrap px-10 py-3.5 rounded-xl font-bold shrink-0"
                >
                    <Plus size={18} />
                    ADD PRODUCT
                </button>
            </div>

            <h1 className="admin-section-title admin-title text-2xl md:text-3xl font-heading text-gold">Products Management</h1>

            {/* Product grid - 3 columns, wireframe card style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse bg-white/5" />
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-24 text-center glass-panel rounded-2xl border border-white/5">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-20 text-gold" />
                        <h3 className="text-gray-500 font-medium">No products match your filters.</h3>
                    </div>
                ) : (
                    filteredProducts.map((product, idx) => {
                        const stockInfo = getStockInfo(product);
                        const isInStock = stockInfo.label === 'Fully Stocked' || stockInfo.label === 'IN STOCK';
                        const isLowStock = stockInfo.label === 'Low Stock' || stockInfo.label === 'LOW STOCK';
                        return (
                            <div
                                key={product.id}
                                className="glass-panel group rounded-2xl overflow-hidden flex items-center p-4 border border-white/5 hover:border-gold/20 transition-all gap-4"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="w-[55px] h-[55px] bg-black rounded-lg overflow-hidden shrink-0 relative">
                                    <img
                                        src={product.image || product.imageUrl || IMAGE_MAP[product.imageType] || IMAGE_MAP.divine}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {product.featured && (
                                        <div className="absolute -top-1 -left-1 bg-gold text-black p-0.5 rounded shadow-lg z-10">
                                            <Check size={8} strokeWidth={5} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setCurrentProductId(product.id); setIsModalOpen(true); }}
                                            className="text-gray-500 hover:text-gold transition-colors shrink-0"
                                            aria-label="Options"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                    <p className="text-gold font-medium text-xs">${Number(product.price).toFixed(2)}</p>
                                    <div className="mt-1 flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-gray-400">Stock: {Number(product.stock) || 0}</span>
                                        <span className={`text-[10px] font-bold ${isInStock ? 'text-green-400' : isLowStock ? 'text-orange-400' : 'text-red-400'}`}>
                                            {isInStock ? 'IN STOCK' : isLowStock ? 'LOW STOCK' : 'OUT'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Premium Full-Sceen Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-[#030303]/95 backdrop-blur-2xl flex justify-end animate-reveal">
                    <div className="w-full max-w-2xl bg-[#0a0a0a] border-l border-white/10 h-full overflow-y-auto flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10">
                            <div>
                                <h2 className="text-2xl font-heading text-white">{currentProductId ? 'Update Product' : 'Establish New Entry'}</h2>
                                <p className="text-[10px] text-gold font-bold tracking-[0.2em] uppercase mt-1">Catalog Registry</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setCurrentProductId(null); }} className="p-2 rounded-full border border-white/5 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-10 pb-24">
                            <section className="space-y-6">
                                <h3 className="text-label border-b border-white/5 pb-2">Primary Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Stock Keeping Unit (SKU)</label>
                                        <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="admin-input font-mono" placeholder="AMB-CORE-001" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Classification</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="admin-input bg-black">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Display Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="Luxury Cinnamon Blend" required />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-label border-b border-white/5 pb-2">Financials & Inventory</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Price ($)</label>
                                        <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Cost ($)</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Stock</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-gray-500 font-bold uppercase">Warn At</label>
                                        <input type="number" value={formData.reorderPoint} onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-label border-b border-white/5 pb-2">Visual Merchandising</h3>
                                <div>
                                    <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block">Asset Selection</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {Object.entries(IMAGE_MAP).map(([type, path]) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageType: type, image: null })}
                                                className={`w-[55px] h-[55px] rounded-lg overflow-hidden border-2 transition-all ${formData.imageType === type ? 'border-gold p-0.5' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                            >
                                                <img src={path} alt={type} className="w-full h-full object-cover rounded-md" />
                                            </button>
                                        ))}
                                        <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-gold hover:text-gold cursor-pointer transition-all">
                                            {uploading ? <div className="w-4 h-4 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /> : <Plus size={20} />}
                                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
                                    <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${formData.featured ? 'bg-gold' : 'bg-white/10'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.featured ? 'left-6' : 'left-1'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">Featured Product</p>
                                        <p className="text-[10px] text-gray-500">Enable to showcase this product in the home store gallery.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-2">
                                <label className="text-[11px] text-gray-500 font-bold uppercase">Detailed Narrative</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-input min-h-[150px] resize-none leading-relaxed"
                                    placeholder="Enter premium product description..."
                                    required
                                />
                            </section>

                            <div className="pt-6 flex gap-4">
                                {currentProductId && (
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ show: true, id: currentProductId })}
                                        className="btn-premium btn-premium-outline !border-red-500/30 !text-red-500 hover:!bg-red-500/10"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button type="submit" className="flex-1 btn-premium btn-premium-gold !py-4">
                                    {currentProductId ? 'Commit Updates' : 'Publish Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content p-8 text-center glass-panel">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-heading text-white mb-2">Internal Removal</h3>
                        <p className="text-gray-500 text-sm mb-8">Are you certain you wish to purge this item from the catalog? This action is absolute.</p>
                        <div className="flex gap-4">
                            <button className="flex-1 btn-premium btn-premium-outline" onClick={() => setDeleteConfirm({ show: false, id: null })}>Retain</button>
                            <button className="flex-1 btn-premium bg-red-600 text-white" onClick={confirmDelete}>Execute Purge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
