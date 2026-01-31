import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, AlertTriangle, Package, Search, Image as ImageIcon, DollarSign } from 'lucide-react';
import './Admin.css';

// Image Map for standard assets
const IMAGE_MAP = {
    'divine': '/Ambrosia/images/divine.png',
    'kuveni': '/Ambrosia/images/kuveni.png',
    'ravana': '/Ambrosia/images/ravana.png',
    'garden': '/Ambrosia/images/garden.png'
};

const CATEGORIES = ['Powder', 'Sticks', 'Blends', 'Gift Sets', 'Limited Edition'];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);


    const [formData, setFormData] = useState({
        sku: '', name: '', category: 'Powder', price: '', cost: '',
        stock: '', reorderPoint: 10, imageType: 'divine', imageUrl: ''
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Metrics
    const totalAssetCost = products.reduce((sum, i) => sum + ((Number(i.cost) || 0) * (Number(i.stock) || 0)), 0);
    const totalRetailValue = products.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.stock) || 0)), 0);
    const lowStockCount = products.filter(i => (Number(i.stock) || 0) <= (Number(i.reorderPoint) || 0)).length;

    const getStatusStyle = (item) => {
        const stock = Number(item.stock) || 0;
        const point = Number(item.reorderPoint) || 0;
        if (stock === 0) return { label: "Depleted", color: "status-badge cancelled" };
        if (stock <= 5) return { label: "Critical", color: "status-badge cancelled !text-red-500" };
        if (stock <= point) return { label: "Low Level", color: "status-badge pending" };
        return { label: "Optimized", color: "status-badge completed" };
    };

    const openModal = (product = null) => {
        setCurrentProduct(product);
        if (product) {
            setFormData({
                sku: product.sku || '', name: product.name || '', category: product.category || 'Powder',
                price: product.price || '', cost: product.cost || '', stock: product.stock || '',
                reorderPoint: product.reorderPoint || 10, imageType: product.imageType || 'divine',
                imageUrl: product.imageUrl || ''
            });
        } else {
            setFormData({
                sku: '', name: '', category: 'Powder', price: '', cost: '',
                stock: '', reorderPoint: 10, imageType: 'divine', imageUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price),
            cost: Number(formData.cost),
            stock: Number(formData.stock),
            reorderPoint: Number(formData.reorderPoint)
        };

        try {
            if (currentProduct) {
                await updateDoc(doc(db, "products", currentProduct.id), payload);
            } else {
                await addDoc(collection(db, "products"), payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            alert("Failed to save product: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Confirm deletion of this high-value asset?")) {
            await deleteDoc(doc(db, "products", id));
        }
    };

    const [filterCategory, setFilterCategory] = useState('All');

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-gold/50 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Portfolio...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 animate-fade-in">
            <div className="admin-header flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="admin-title">Portfolio <span className="highlight">Catalogue</span></h1>
                        <p className="admin-subtitle opacity-70 mt-2">Stock Monitoring & Intelligent Asset Management</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-gold flex items-center justify-center gap-3 !px-8 !py-3"
                    >
                        <Plus size={16} strokeWidth={3} /> Initialize Asset
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between w-full">
                    {/* Shop-like Filter Pills */}
                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide order-2 lg:order-1">
                        {['All', ...CATEGORIES].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`filter-btn whitespace-nowrap ${filterCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto order-1 lg:order-2">
                        <div className="relative group w-full lg:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Seek Catalogue Item..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium-dark w-full lg:w-72 pl-12"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card p-6 md:p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Portfolio Cost</p>
                        <h3 className="text-3xl font-heading text-white tracking-tighter">${totalAssetCost.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500 shadow-xl"><DollarSign size={24} /></div>
                </div>
                <div className="admin-card p-6 md:p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Market Valuation</p>
                        <h3 className="text-3xl font-heading text-gold tracking-tighter">${totalRetailValue.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500 shadow-xl"><Package size={24} /></div>
                </div>
                <div className="admin-card p-6 md:p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mb-3">Supply Alerts</p>
                        <h3 className={`text-3xl font-heading tracking-tighter ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockCount}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-500 shadow-xl ${lowStockCount > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}><AlertTriangle size={24} /></div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="admin-table-container">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="admin-table min-w-[1000px]">
                        <thead>
                            <tr>
                                <th className="pl-12">Visual ID</th>
                                <th>Nomenclature</th>
                                <th>Tier</th>
                                <th className="text-right">Valuation</th>
                                <th className="text-center">Reserves</th>
                                <th>Condition</th>
                                <th className="pr-12 text-right">Registry Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(item => {
                                const status = getStatusStyle(item);
                                const isCritical = status.label === "Critical" || status.label === "Depleted";
                                return (
                                    <tr key={item.id} className={`group transition-all duration-500 ${isCritical ? 'bg-red-900/[0.05]' : ''}`}>
                                        <td className="pl-12">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-700 shadow-xl relative">
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                                {item.imageUrl || IMAGE_MAP[item.imageType] ? (
                                                    <img
                                                        src={item.imageUrl || IMAGE_MAP[item.imageType]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = IMAGE_MAP['divine'];
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gold/20">
                                                        <ImageIcon size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`text-sm font-bold tracking-tight mb-1 transition-colors ${isCritical ? 'text-red-400' : 'text-white group-hover:text-gold'}`}>{item.name}</div>
                                            <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-60">REF-{item.sku || item.id.slice(0, 8).toUpperCase()}</div>
                                        </td>
                                        <td className="text-[10px] text-gold/40 uppercase tracking-[0.2em] font-black">{item.category}</td>
                                        <td className="text-sm font-black text-white text-right italic">${Number(item.price).toFixed(2)}</td>
                                        <td className={`text-sm font-black text-center ${isCritical ? 'text-red-500' : 'text-white'}`}>{item.stock}</td>
                                        <td>
                                            <span className={status.color}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="pr-12 text-right">
                                            <div className="flex gap-4 justify-end opacity-20 group-hover:opacity-100 transition-all duration-500">
                                                <button onClick={() => openModal(item)} className="btn-ghost !p-2 !rounded-lg hover:text-gold hover:bg-gold/10"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="btn-ghost !p-2 !rounded-lg hover:text-red-500 hover:bg-red-500/10"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Modal - Redesigned */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
                    <div className="admin-card w-full max-w-3xl overflow-hidden animate-scale-in border-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.1)] relative !p-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gold/5">
                            <div>
                                <h2 className="text-3xl font-heading text-white">
                                    {currentProduct ? 'Modify' : 'Initialize'} <span className="text-gold">Asset</span>
                                </h2>
                                <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em] font-black mt-2 opacity-60">High-Fidelity Inventory Management</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-white transition-all text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 md:p-12 grid grid-cols-2 gap-8 custom-scrollbar max-h-[70vh] overflow-y-auto">
                            <div className="col-span-1">
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Reference SKU</label>
                                <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono"
                                    value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Asset Tier</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all cursor-pointer font-bold uppercase tracking-widest"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-[#050505]">{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Nomenclature</label>
                                <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-sm transition-all font-heading tracking-tight"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Market Value ($)</label>
                                <input type="number" step="0.01" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Initial Cost ($)</label>
                                <input type="number" step="0.01" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono"
                                    value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Reserve Quantity</label>
                                <input type="number" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono"
                                    value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-3 ml-1">Critical Point</label>
                                <input type="number" required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono"
                                    value={formData.reorderPoint} onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })} />
                            </div>
                            <div className="col-span-2 bg-gold/[0.02] p-8 rounded-[2rem] border border-gold/10 relative overflow-hidden group/viz">
                                <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-6 flex items-center gap-3">
                                    <ImageIcon size={14} />
                                    Visual Representation Matrix
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {Object.entries(IMAGE_MAP).map(([type, path]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageType: type, imageUrl: '' })}
                                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-500 ${formData.imageType === type ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02] ring-4 ring-gold/5' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                                        >
                                            <img src={path} alt={type} className="w-full h-full object-cover" />
                                            {formData.imageType === type && (
                                                <div className="absolute inset-0 bg-gold/20 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="bg-white rounded-full p-1.5 text-black shadow-lg animate-scale-in">
                                                        <Plus size={12} className="rotate-45" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-gold/30 mb-4 ml-1">Custom External Origin (URL)</label>
                                    <input
                                        type="url"
                                        placeholder="https://cloud-storage.ambrosia.com/assets/..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none text-xs transition-all font-mono shadow-inner"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value, imageType: '' })}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 flex justify-end gap-6 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-all py-3">Abort Transaction</button>
                                <button type="submit" className="btn-gold !px-12 !py-4 !text-[10px] !tracking-[0.25em]">Sync to Registry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
