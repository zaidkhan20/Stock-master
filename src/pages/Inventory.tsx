import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  ArrowUpDown,
  Download,
  Terminal,
  Activity,
  Box,
  ChevronRight,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { Product, Category } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Inventory: React.FC = () => {
  const { isStaff, isAdmin, profile } = useAuth();
  const { data: products, loading } = useCollection<Product>('products');
  const { data: categories } = useCollection<Category>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !profile) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      categoryId: formData.get('categoryId') as string,
      quantity: Number(formData.get('quantity')),
      minStock: Number(formData.get('minStock')),
      price: Number(formData.get('price')),
      unit: formData.get('unit') as string,
      description: formData.get('description') as string,
      updatedAt: serverTimestamp(),
      updatedBy: profile.id,
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      handleFirestoreError(err, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !window.confirm('Terminate entity signature (Delete Product)?')) return;
    try {
      const productPath = `products/${id}`;
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-slate-950 pl-6 py-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">Inventory Registry</h1>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Box size={12} className="text-zinc-400" /> 
            Active SKU Nodes: {filteredProducts.length} / Global: {products.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Download size={14} />
            Export CSV
          </button>
          {isStaff && (
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="h-10 px-4 rounded bg-slate-950 text-white hover:bg-zinc-800 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} />
              Initialize SKU
            </button>
          )}
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white border border-zinc-200 p-4 rounded-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-slate-950 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="FILTER BY SKU OR COMPONENT NAME..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-sm pl-10 pr-4 py-2.5 text-[11px] font-mono uppercase tracking-tight focus:ring-1 focus:ring-slate-950/10 focus:border-slate-950 outline-none transition-all placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1 border border-zinc-100 rounded-sm">
             <Filter size={14} className="text-zinc-400" />
             <select 
               className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer"
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
             >
               <option value="all">ALL_CATEGORIES</option>
               {categories.map(c => (
                 <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="p-4 text-left">
                 <div className="flex items-center gap-2 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">
                   Component Details
                   <ArrowUpDown size={10} />
                 </div>
              </th>
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">SKU_ID</th>
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Category</th>
              <th className="p-4 text-center text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Available</th>
              <th className="p-4 text-right text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Unit_Price</th>
              <th className="p-4 text-center text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="group hover:bg-zinc-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-950">{product.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[200px] mt-0.5">{product.description}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded-sm">{product.sku}</span>
                </td>
                <td className="p-4">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                     {categories.find(c => c.id === product.categoryId)?.name || 'UNCLASSIFIED'}
                   </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "text-[12px] font-mono font-black tabular-nums",
                      product.quantity <= product.minStock ? "text-red-600" : "text-slate-950"
                    )}>
                      {product.quantity.toString().padStart(3, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-300 uppercase mt-0.5">{product.unit || 'PCS'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-mono font-bold text-slate-950">${product.price.toFixed(2)}</span>
                    <span className="text-[9px] font-mono text-zinc-300 uppercase">USD</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    {product.quantity === 0 ? (
                      <span className="px-2 py-0.5 bg-red-950 text-white text-[9px] font-bold rounded-sm uppercase tracking-tighter">Depleted</span>
                    ) : product.quantity <= product.minStock ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-sm uppercase tracking-tighter flex items-center gap-1">
                        <AlertCircle size={10} /> Low_Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded-sm uppercase tracking-tighter">Optimal</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isStaff && (
                      <>
                        <button 
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="p-2 text-zinc-400 hover:text-slate-950 hover:bg-zinc-200 transition-all rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button className="p-2 text-zinc-400 hover:text-slate-950 hover:bg-white border border-transparent hover:border-zinc-200 transition-all rounded">
                          <ChevronRight size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-2 border-zinc-200 border-t-slate-950 rounded-full animate-spin" />
             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Accessing Registry...</span>
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <Terminal size={32} className="text-zinc-200" />
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">No matching nodes found</p>
                <p className="text-[10px] font-mono text-zinc-300">SYSTEM_ERROR_CODE: 404_SKU_NULL</p>
             </div>
             <button 
               onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
               className="mt-2 text-[10px] font-bold text-slate-950 hover:underline underline-offset-4 uppercase tracking-widest"
             >
                Reset Filter Mask
             </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-zinc-200 p-8 shadow-2xl rounded-sm"
            >
              <div className="flex justify-between items-start mb-8 border-l-4 border-slate-950 pl-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">SKU Initialization</h2>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Mode: {editingProduct ? 'Update_Existing_Node' : 'Create_New_Entity'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Authorized By</p>
                  <p className="text-[11px] font-bold uppercase tracking-tight">{profile?.name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Component Name</label>
                    <input 
                      name="name" 
                      required 
                      defaultValue={editingProduct?.name}
                      placeholder="e.g. CORE-PROCESSOR-X1"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-bold uppercase tracking-tight focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SKU_SERIAL</label>
                    <input 
                      name="sku" 
                      required 
                      defaultValue={editingProduct?.sku}
                      placeholder="SKU-XXXX-XXXX"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono uppercase tracking-tight focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category Tag</label>
                    <select 
                      name="categoryId" 
                      required 
                      defaultValue={editingProduct?.categoryId}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-slate-950 outline-none rounded-sm cursor-pointer"
                    >
                      <option value="">SELECT_CATEGORY</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unit of Measure</label>
                    <input 
                      name="unit" 
                      required 
                      defaultValue={editingProduct?.unit || 'pcs'}
                      placeholder="pcs, kg, box"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-bold uppercase tracking-tight focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Initial Quantity</label>
                    <input 
                      name="quantity" 
                      type="number" 
                      required 
                      defaultValue={editingProduct?.quantity || 0}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono font-bold focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Min. Threshold</label>
                    <input 
                      name="minStock" 
                      type="number" 
                      required 
                      defaultValue={editingProduct?.minStock || 10}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono font-bold focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unit Val (USD)</label>
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      required 
                      defaultValue={editingProduct?.price || 0}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono font-bold focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Component Description</label>
                  <textarea 
                    name="description" 
                    rows={3} 
                    defaultValue={editingProduct?.description}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    placeholder="Enter detailed specifications..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-slate-950 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg"
                  >
                    Commit Changes
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
