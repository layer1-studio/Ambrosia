import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Image as ImageIcon, Search, Edit2, Trash2, AlertTriangle, DollarSign, Package } from 'lucide-react';
import './Admin.css';

// Image Map for standard assets
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

    // Form State
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
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
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
        } else if (!currentProductId && isModalOpen) {
            setFormData({
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
        }
    }, [currentProductId, currentProduct, isModalOpen]);

    useEffect(() => {
        if (currentProductId && currentProduct) setIsModalOpen(true);
    }, [currentProductId, currentProduct]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const storageRef = ref(storage, `products/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, image: url, imageType: '' }));
            setUploading(false);
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
            setIsModalOpen(false);
        } catch (error) {
            alert("Error saving product: " + error.message);
        }
    };

    const handleDelete = (id, e) => {
        if (e) e.stopPropagation();
        setDeleteConfirm({ show: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            await deleteDoc(doc(db, "products", deleteConfirm.id));
            setDeleteConfirm({ show: false, id: null });
        }
    };

    // Metrics
    const totalAssetCost = products.reduce((sum, i) => sum + ((Number(i.cost) || 0) * (Number(i.stock) || 0)), 0);
    const totalRetailValue = products.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.stock) || 0)), 0);
    const lowStockCount = products.filter(i => (Number(i.stock) || 0) <= (Number(i.reorderPoint) || 10)).length;

    const getStatusStyle = (item) => {
        const stock = Number(item.stock) || 0;
        const point = Number(item.reorderPoint) || 10;
        if (stock === 0) return { label: "Depleted", color: "text-red-500" };
        if (stock <= 5) return { label: "Critical", color: "text-red-400" };
        if (stock <= point) return { label: "Low", color: "text-yellow-500" };
        return { label: "Optimized", color: "text-green-500" };
    };

    const [activeCategory, setActiveCategory] = useState('All');

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProductId(null);
    };

    const openCreateModal = () => {
        setCurrentProductId(null);
        setFormData({
            sku: '', name: '', price: '', cost: '', category: 'Skin Care', description: '',
            image: null, imageType: 'divine', stock: '0', reorderPoint: '10', featured: false
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div>
                    <h1 className="text-6xl md:text-7xl font-heading text-white tracking-tighter mb-4">Inventory</h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Manage Your Collection</p>
                </div>

            </div>

            {/* Search + Add */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 w-72 text-sm text-white focus:border-gold focus:outline-none transition-all placeholder:text-gray-500"
                    />
                </div>
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-gold focus:outline-none cursor-pointer min-w-[140px]"
                >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                    ))}
                </select>
                <button
                    onClick={openCreateModal}
                    className="btn-gold flex items-center gap-2 !py-2.5 !px-8 rounded-xl shadow-lg shadow-gold/10 hover:shadow-gold/20 mr-2"
                >
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.04] transition-all duration-500">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Total Cost</p>
                        <h3 className="text-3xl font-heading text-white tracking-tighter">${totalAssetCost.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500"><DollarSign size={24} /></div>
                </div>
                <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.04] transition-all duration-500">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Retail Value</p>
                        <h3 className="text-3xl font-heading text-gold tracking-tighter">${totalRetailValue.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500"><Package size={24} /></div>
                </div>
                <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.04] transition-all duration-500">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Low Stock Alerts</p>
                        <h3 className={`text-3xl font-heading tracking-tighter ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockCount}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${lowStockCount > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}><AlertTriangle size={24} /></div>
                </div>
            </div>

            {/* Product Table + Side Panel */}
            <div className="flex gap-8 items-start relative">
                <div className={`flex-1 min-w-0 transition-all duration-300 ${isModalOpen ? 'opacity-60' : ''}`}>
                    <div className="admin-table-container rounded-2xl border border-white/10 overflow-hidden">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Visual ID</th>
                                    <th>Nomenclature</th>
                                    <th>Tier</th>
                                    <th className="text-right">Valuation</th>
                                    <th className="text-center">Reserves</th>
                                    <th>Condition</th>
                                    <th className="text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="py-24 text-center text-gold/40 text-xs uppercase tracking-widest animate-pulse">Loading...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan={7} className="py-24 text-center text-gray-600 text-xs uppercase tracking-widest">No products</td></tr>
                                ) : (
                                    filteredProducts.map(product => {
                                        const status = getStatusStyle(product);
                                        return (
                                            <tr
                                                key={product.id}
                                                onClick={() => { setCurrentProductId(product.id); setIsModalOpen(true); }}
                                                className="cursor-pointer hover:bg-white/[0.02]"
                                            >
                                                <td>
                                                    <div className="w-[50px] h-[50px] rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-inner bg-white/5">
                                                        <img src={product.image || product.imageUrl || IMAGE_MAP[product.imageType] || IMAGE_MAP.divine} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="font-semibold text-white">{product.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase">REF-{product.sku || product.id?.slice(0, 8).toUpperCase()}</p>
                                                </td>
                                                <td className="text-[11px] uppercase tracking-wider text-gray-400">{product.category}</td>
                                                <td className="text-right font-mono text-white">${Number(product.price || 0).toFixed(2)}</td>
                                                <td className="text-center font-mono text-white">{product.stock ?? 0}</td>
                                                <td>
                                                    <span className={`status-badge ${status.label === 'Depleted' ? 'cancelled' : status.label === 'Critical' ? 'cancelled' : status.label === 'Low' ? 'pending' : 'completed'}`}>{status.label}</span>
                                                </td>
                                                <td className="text-right pr-6">
                                                    <button onClick={(e) => { e.stopPropagation(); setCurrentProductId(product.id); setIsModalOpen(true); }} className="p-2 rounded-lg text-gray-500 hover:text-gold hover:bg-gold/10 transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={(e) => handleDelete(product.id, e)} className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel - Edit/Add Form */}
                {isModalOpen && (
                    <div className="fixed top-20 right-0 h-[calc(100vh-5rem)] w-full max-w-xl bg-[#080808] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-50 animate-slide-in-right overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-heading text-white">{currentProductId ? 'Edit Product' : 'New Product'}</h2>
                            <button type="button" onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Product SKU</label>
                                <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="admin-input font-mono" placeholder="REF-XXXX" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Product Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="E.g. Lunar Elixir" required />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Price ($)</label>
                                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="admin-input font-mono" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Cost ($)</label>
                                    <input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="admin-input font-mono" placeholder="0.00" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Stock</label>
                                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="admin-input font-mono" placeholder="0" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Reorder At</label>
                                    <input type="number" value={formData.reorderPoint} onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })} className="admin-input font-mono" placeholder="10" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="admin-input bg-[#0a0a0a]">
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Image</label>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(IMAGE_MAP).map(([type, path]) => (
                                        <button key={type} type="button" onClick={() => setFormData({ ...formData, imageType: type, image: null })} className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${formData.imageType === type ? 'border-gold' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                                            <img src={path} alt={type} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                <label className="cursor-pointer btn-ghost !py-2 !text-xs block text-center w-full">
                                    {uploading ? 'Uploading...' : 'Upload custom image'}
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5 cursor-pointer" onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.featured ? 'bg-gold' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.featured ? 'left-6' : 'left-1'}`}></div>
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.featured ? 'text-gold' : 'text-gray-500'}`}>Featured</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="admin-input min-h-[100px] resize-none" placeholder="Product details..." required></textarea>
                            </div>

                            <button type="submit" className="w-full btn-gold !rounded-xl !py-4 mt-4 shadow-xl shadow-gold/10">
                                {currentProductId ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm({ show: false, id: null })}></div>
                    <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-in text-center">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-heading text-white mb-2">Delete Artifact?</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">This action is permanent and cannot be reversed. Are you sure?</p>
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

export default Products;
