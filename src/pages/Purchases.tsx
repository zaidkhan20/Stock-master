import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Calendar, 
  Tag, 
  User,
  Hash,
  X,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: any;
}

export const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newPurchase, setNewPurchase] = useState({
    productId: '',
    supplierId: '',
    batchNumber: '',
    quantity: 0,
    unitPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Current purchases
    const q = query(collection(db, 'purchases'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPurchases(data.sort((a: any, b: any) => b.purchaseDate.seconds - a.purchaseDate.seconds));
    });

    // Need products and suppliers for select menus
    const pUnsubscribe = onSnapshot(query(collection(db, 'products')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const sUnsubscribe = onSnapshot(query(collection(db, 'suppliers')), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      pUnsubscribe();
      sUnsubscribe();
    }
  }, []);

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchase.productId || !newPurchase.supplierId) return;

    try {
      const product = products.find(p => p.id === newPurchase.productId);
      const supplier = suppliers.find(s => s.id === newPurchase.supplierId);

      // 1. Create Purchase record
      await addDoc(collection(db, 'purchases'), {
        ...newPurchase,
        productName: product.name,
        supplierName: supplier.name,
        totalPrice: newPurchase.quantity * newPurchase.unitPrice,
        purchaseDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // 2. Update Product Quantity
      const productRef = doc(db, 'products', newPurchase.productId);
      await updateDoc(productRef, {
        quantity: increment(newPurchase.quantity),
        updatedAt: serverTimestamp()
      });

      setShowAddModal(false);
      setNewPurchase({ productId: '', supplierId: '', batchNumber: '', quantity: 0, unitPrice: 0, purchaseDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Records</h1>
          <p className="text-slate-500">Log new stock arrivals and supplier transactions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <ShoppingCart className="w-5 h-5" />
          Record New Purchase
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by product, supplier or batch..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPurchases.map((p) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg leading-tight">{p.productName}</div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium tracking-tight">
                    <User className="w-3 h-3" /> {p.supplierName}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium tracking-tight">
                    <Hash className="w-3 h-3" /> Batch: <span className="text-slate-900">{p.batchNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 lg:max-w-2xl px-4">
               <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Quantity</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{p.quantity} Units</div>
               </div>
               <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Unit Price</div>
                  <div className="font-bold text-slate-900 text-sm">₨ {p.unitPrice}</div>
               </div>
               <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Value</div>
                  <div className="font-bold text-slate-900 text-sm font-mono subray">₨ {p.totalPrice.toLocaleString()}</div>
               </div>
               <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Date</div>
                  <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                    <Calendar className="w-3 h-3" /> 
                    {p.purchaseDate?.seconds ? format(new Date(p.purchaseDate.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black uppercase rounded-lg hover:bg-slate-100 transition-colors">
                 Full Details
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Purchase Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Record Purchase</h2>
                  <p className="text-slate-500 text-sm">Fill in the details to update inventory</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddPurchase} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Product Selection
                    </label>
                    <select 
                      required
                      value={newPurchase.productId}
                      onChange={(e) => setNewPurchase({...newPurchase, productId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" /> Supplier
                    </label>
                    <select 
                      required
                      value={newPurchase.supplierId}
                      onChange={(e) => setNewPurchase({...newPurchase, supplierId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                    >
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Hash className="w-3 h-3" /> Batch Number
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. BATCH-2023-A"
                      value={newPurchase.batchNumber}
                      onChange={(e) => setNewPurchase({...newPurchase, batchNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Plus className="w-3 h-3" /> Quantity Purchased
                    </label>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase({...newPurchase, quantity: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit Cost (PKR)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      value={newPurchase.unitPrice}
                      onChange={(e) => setNewPurchase({...newPurchase, unitPrice: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-xl"
                    />
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl flex flex-col justify-center">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Transaction</div>
                    <div className="text-2xl font-black text-white font-mono">₨ {(newPurchase.quantity * newPurchase.unitPrice).toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                   >
                     Confirm & Update Stock
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
