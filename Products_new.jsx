import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Image as ImageIcon, Search, Edit2, Trash2 } from 'lucide-react';
import './Admin.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Skin Care',
        description: '',
        image: null,
        stock: '0',
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
                name: currentProduct.name,
                price: currentProduct.price,
                category: currentProduct.category,
                description: currentProduct.description,
                image: currentProduct.image,
                stock: currentProduct.stock,
                featured: currentProduct.featured || false
            });
            setIsModalOpen(true);
        } else if (!currentProductId) {
            setFormData({
                name: '',
                price: '',
                category: 'Skin Care',
                description: '',
                image: null,
                stock: '0',
                featured: false
            });
        }
    }, [currentProductId, currentProduct]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const storageRef = ref(storage, `products/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, image: url }));
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProductId) {
                await updateDoc(doc(db, "products", currentProductId), formData);
            } else {
                await addDoc(collection(db, "products"), formData);
            }
            setIsModalOpen(false);
            setCurrentProductId(null);
        } catch (error) {
            alert("Error saving product: " + error.message);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this product?")) {
            await deleteDoc(doc(db, "products", id));
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setCurrentProductId(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div>
                    <h1 className="text-6xl md:text-7xl font-heading text-white tracking-tighter mb-4">Gallery</h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Curate Your Collection</p>
                </div>

                <div className="flex gap-6 items-center">
                    <div className="relative group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH COLLECTION..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-white/10 py-2 pl-6 pr-4 w-64 text-sm text-white focus:border-gold outline-none transition-all placeholder:text-gray-700 font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Add New Card */}
                <button
                    onClick={openCreateModal}
                    className="group min-h-[400px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-6 hover:bg-white/[0.02] hover:border-gold/30 transition-all duration-500"
                >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-gold group-hover:text-black transition-all duration-500">
                        <Plus size={32} />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold group-hover:text-gold">Add New Artifact</span>
                </button>

                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 h-[400px] rounded-2xl"></div>)
                ) : (
                    filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => setCurrentProductId(product.id)}
                            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0">
                                <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-500"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">{product.category}</p>
                                <h3 className="text-2xl font-heading text-white mb-2">{product.name}</h3>
                                <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
                                    <span className="text-xl font-mono text-white">${product.price}</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold ${Number(product.stock) > 5 ? 'text-green-400' : 'text-red-400'}`}>
                                        {Number(product.stock) > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Float Actions */}
                            <button
                                onClick={(e) => handleDelete(product.id, e)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Inline Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row max-h-[90vh]">
                        {/* Image Side */}
                        <div className="w-full md:w-1/2 p-8 bg-white/[0.02] flex items-center justify-center relative border-r border-white/5">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="max-w-full max-h-[400px] object-contain shadow-2xl rounded-lg" />
                            ) : (
                                <div className="text-center opacity-30">
                                    <ImageIcon size={64} className="mx-auto mb-4" strokeWidth={1} />
                                    <p className="text-xs uppercase tracking-widest">No Image Details</p>
                                </div>
                            )}
                            <label className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer btn-gold shadow-lg">
                                {uploading ? 'Processing...' : 'Upload Asset'}
                                <input type="file" hidden onChange={handleImageUpload} />
                            </label>
                        </div>

                        {/* Form Side */}
                        <div className="w-full md:w-1/2 p-10 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-heading text-white">{currentProductId ? 'Edit Product' : 'New Product'}</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Product Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="E.g. Lunar Elixir" required />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Price ($)</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="admin-input font-mono" placeholder="0.00" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Stock</label>
                                        <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="admin-input font-mono" placeholder="0" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="admin-input bg-black">
                                        <option>Skin Care</option>
                                        <option>Hair Care</option>
                                        <option>Wellness</option>
                                        <option>Sets</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="admin-input min-h-[120px] resize-none" placeholder="Product details..." required></textarea>
                                </div>

                                <button type="submit" className="w-full btn-gold !rounded-xl !py-4 mt-4">
                                    {currentProductId ? 'Update Artifact' : 'Publish Artifact'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
