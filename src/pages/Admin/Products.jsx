import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Search, AlertTriangle, Image as ImageIcon, Check, MoreVertical } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './Admin.css';

const IMAGE_MAP = {
    'divine': '/Ambrosia/images/divine.png',
    'kuveni': '/Ambrosia/images/kuveni.png',
    'ravana': '/Ambrosia/images/ravana.png',
    'garden': '/Ambrosia/images/garden.png'
};

const CATEGORIES = ['Powder', 'Sticks', 'Blends', 'Gift Sets', 'Limited Edition', 'Skin Care', 'Hair Care', 'Wellness', 'Sets'];

const Products = () => {
    const { formatPrice } = useCurrency();
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
        if (stock === 0) return { label: "Out", cls: 'danger' };
        if (stock <= point) return { label: "Low", cls: 'warning' };
        return { label: "In stock", cls: 'success' };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const openNew = () => {
        setCurrentProductId(null);
        setFormData({ sku: '', name: '', price: '', cost: '', category: 'Skin Care', description: '', image: null, imageType: 'divine', stock: '0', reorderPoint: '10', featured: false });
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Category tabs + search + new product */}
            <div className="border-b-2 border-[#1c1a17] px-7 h-12 flex items-center justify-between gap-4">
                <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`admin-pill ${activeCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 h-[34px] px-3 border border-[#1c1a17] bg-[#0a0a0a] w-56 shrink-0">
                    <Search size={13} className="text-[#615c54] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search name, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-none text-[#f2efe9] text-xs outline-none placeholder:text-[#615c54]"
                    />
                </div>
                <button
                    type="button"
                    onClick={openNew}
                    className="btn-premium btn-premium-gold shrink-0"
                >
                    <Plus size={14} />
                    New product
                </button>
            </div>

            {/* Stat cells */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b-2 border-[#1c1a17]">
                <div className="px-7 py-4.5 py-[18px] border-b sm:border-b-0 sm:border-r border-[#1c1a17]">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a857e]">Inventory cost</span>
                    <p className="m-0 mt-2 text-2xl font-semibold text-[#f2efe9] font-mono">{formatPrice(stats.totalCost)}</p>
                </div>
                <div className="px-7 py-[18px] border-b sm:border-b-0 sm:border-r border-[#1c1a17]">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a857e]">Retail value</span>
                    <p className="m-0 mt-2 text-2xl font-semibold text-[#f2efe9] font-mono">{formatPrice(stats.retailVal)}</p>
                </div>
                <div className="px-7 py-[18px]">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a857e]">Below reorder point</span>
                    <p className="m-0 mt-2 text-2xl font-semibold font-mono" style={{ color: stats.lowStock > 0 ? '#f87171' : '#f2efe9' }}>{stats.lowStock}</p>
                </div>
            </div>

            {/* Products table */}
            {loading ? (
                <div className="p-7 text-[#615c54] text-sm">Loading catalog…</div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center">
                    <ImageIcon size={40} className="mx-auto mb-4 opacity-20 text-gold" />
                    <h3 className="text-[#615c54] font-medium text-sm">No products match your filters.</h3>
                </div>
            ) : (
                <table className="admin-table w-full">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Stock</th>
                            <th>State</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const stockInfo = getStockInfo(product);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-[#111] shrink-0 relative grayscale">
                                                <img
                                                    src={product.image || product.imageUrl || IMAGE_MAP[product.imageType] || IMAGE_MAP.divine}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {product.featured && (
                                                    <div className="absolute -top-1 -left-1 bg-gold text-black p-0.5">
                                                        <Check size={8} strokeWidth={5} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-[#f2efe9]">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="font-mono text-[11px] text-[#8a857e]">{product.sku || '—'}</td>
                                    <td className="text-[#c9c4bb]">{product.category}</td>
                                    <td className="text-right font-mono">{formatPrice(product.price)}</td>
                                    <td className="text-right font-mono">{Number(product.stock) || 0}</td>
                                    <td><span className={`status-pill ${stockInfo.cls}`}>{stockInfo.label}</span></td>
                                    <td className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => { setCurrentProductId(product.id); setIsModalOpen(true); }}
                                            className="text-[#615c54] hover:text-gold transition-colors"
                                            aria-label="Edit product"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Product form — slide-over panel */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex justify-end" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="w-full max-w-lg bg-[#0a0a0a] border-l-2 border-[#1c1a17] h-full overflow-y-auto flex flex-col">
                        <div className="p-6 border-b-2 border-[#1c1a17] flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10">
                            <div>
                                <h2 className="m-0 text-lg font-semibold text-[#f2efe9]">{currentProductId ? 'Edit product' : 'Add product'}</h2>
                                <p className="text-[10px] text-gold font-bold tracking-[0.18em] uppercase mt-1">{currentProductId ? formData.sku || 'Product' : 'New catalog entry'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setCurrentProductId(null); }} className="w-8 h-8 border border-[#1c1a17] text-[#8a857e] hover:text-white transition-colors flex items-center justify-center">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8 pb-24">
                            <section className="space-y-4">
                                <h3 className="text-label border-b border-[#1c1a17] pb-2">Primary details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">SKU</label>
                                        <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="admin-input font-mono" placeholder="AMB-CORE-001" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="admin-input bg-black">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-full space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="Luxury Cinnamon Blend" required />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-label border-b border-[#1c1a17] pb-2">Pricing & stock</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Price</label>
                                        <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Cost</label>
                                        <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Stock</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-[#8a857e] font-bold uppercase">Reorder at</label>
                                        <input type="number" value={formData.reorderPoint} onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })} className="admin-input font-mono" required />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-label border-b border-[#1c1a17] pb-2">Image</h3>
                                <div className="flex gap-3 flex-wrap">
                                    {Object.entries(IMAGE_MAP).map(([type, path]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageType: type, image: null })}
                                            className={`w-11 h-11 overflow-hidden border ${formData.imageType === type ? 'border-gold' : 'border-[#1c1a17] opacity-40 hover:opacity-100'}`}
                                        >
                                            <img src={path} alt={type} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    <label className="w-11 h-11 border border-dashed border-[#1c1a17] flex items-center justify-center text-[#615c54] hover:border-gold hover:text-gold cursor-pointer transition-colors">
                                        {uploading ? <div className="w-3.5 h-3.5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /> : <Plus size={16} />}
                                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <label className="flex items-center gap-3 p-3.5 border border-[#1c1a17] cursor-pointer hover:border-[#3a352d] transition-colors">
                                    <input type="checkbox" checked={formData.featured} onChange={() => setFormData({ ...formData, featured: !formData.featured })} className="accent-gold w-4 h-4" />
                                    <div className="flex-1">
                                        <p className="m-0 text-sm text-[#f2efe9]">Featured product</p>
                                        <p className="m-0 text-[10px] text-[#615c54]">Shows on the storefront home page.</p>
                                    </div>
                                </label>
                            </section>

                            <section className="space-y-1.5">
                                <label className="text-[11px] text-[#8a857e] font-bold uppercase">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-input min-h-[130px] resize-none leading-relaxed"
                                    placeholder="Product description..."
                                    required
                                />
                            </section>

                            <div className="pt-2 flex gap-3">
                                {currentProductId && (
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ show: true, id: currentProductId })}
                                        className="btn-premium border border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="submit" className="flex-1 btn-premium btn-premium-gold justify-center">
                                    {currentProductId ? 'Save changes' : 'Add product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteConfirm.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content p-7 text-center">
                        <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center mx-auto mb-5 text-red-500">
                            <AlertTriangle size={22} />
                        </div>
                        <h3 className="text-lg font-semibold text-[#f2efe9] mb-2">Delete this product?</h3>
                        <p className="text-[#8a857e] text-sm mb-7">This removes it from the catalog permanently and can't be undone.</p>
                        <div className="flex gap-3">
                            <button className="flex-1 btn-premium btn-premium-outline justify-center" onClick={() => setDeleteConfirm({ show: false, id: null })}>Cancel</button>
                            <button className="flex-1 btn-premium bg-red-600 text-white justify-center" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
