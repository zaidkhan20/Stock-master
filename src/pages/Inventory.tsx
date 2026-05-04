import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpDown, 
  Download,
  Package,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  sellingPrice: number;
  unit: string;
  categoryId: string;
  description: string;
}

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { userRole } = useAuth();

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    minStock: 0,
    sellingPrice: 0,
    unit: 'Units',
    description: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    return onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    });
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        quantity: 0, // Initial quantity is 0, must be added via "Purchases"
        updatedAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewProduct({ name: '', sku: '', minStock: 0, sellingPrice: 0, unit: 'Units', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Track current stock levels and batch details</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Category
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">
            <ArrowUpDown className="w-4 h-4" />
            Stock Level
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU/Batch</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Selling Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{p.sku}</code>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-bold">
                    ₨ {p.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {p.quantity <= p.minStock ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase">Low Stock</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                         <History className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-900" /></button>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Cement Bag 50kg"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CMT-001"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price (PKR)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({...newProduct, sellingPrice: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Type</label>
                    <select 
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                      <option>Units</option>
                      <option>Kg</option>
                      <option>Liter</option>
                      <option>Feet</option>
                      <option>Bag</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    placeholder="Alert when stock reaches..."
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Additional details..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Save Product
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
