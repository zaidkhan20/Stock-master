import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, isAfter, parseISO } from 'date-fns';
import { 
  Truck, 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Sale {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  profit: number;
  paymentType: 'CASH' | 'CREDIT';
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  saleDate: any;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE';
}

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSale, setNewSale] = useState({
    wholesalerId: '',
    productId: '',
    quantity: 0,
    unitPrice: 0,
    paymentType: 'CASH',
    paidAmount: 0,
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const q = query(collection(db, 'sales'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = { id: doc.id, ...doc.data() } as any;
        // Check for overdue status
        if (item.status !== 'PAID' && item.dueDate && isAfter(new Date(), parseISO(item.dueDate))) {
          item.status = 'OVERDUE';
        }
        return item;
      });
      setSales(data.sort((a, b) => b.saleDate?.seconds - a.saleDate?.seconds));
    });

    onSnapshot(query(collection(db, 'products')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    onSnapshot(query(collection(db, 'wholesalers')), (snapshot) => {
      setWholesalers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.productId || !newSale.wholesalerId) return;

    try {
      const product = products.find(p => p.id === newSale.productId);
      const wholesaler = wholesalers.find(w => w.id === newSale.wholesalerId);

      const total = newSale.quantity * newSale.unitPrice;
      const remaining = total - newSale.paidAmount;
      const profitPerUnit = newSale.unitPrice - (product.averageCost || 0);
      const totalProfit = profitPerUnit * newSale.quantity;

      const status = newSale.paidAmount >= total ? 'PAID' : 'PARTIAL';

      // 1. Create Sale record
      await addDoc(collection(db, 'sales'), {
        ...newSale,
        wholesalerName: wholesaler.name,
        productName: product.name,
        totalPrice: total,
        remainingAmount: remaining,
        profit: totalProfit,
        status,
        saleDate: serverTimestamp()
      });

      // 2. Update Product Stock
      await updateDoc(doc(db, 'products', newSale.productId), {
        quantity: increment(-newSale.quantity),
        updatedAt: serverTimestamp()
      });

      // 3. Update Wholesaler Credit if applicable
      if (remaining > 0) {
        await updateDoc(doc(db, 'wholesalers', newSale.wholesalerId), {
          totalDebt: increment(remaining)
        });
      }

      setShowAddModal(false);
      setNewSale({ 
        wholesalerId: '', 
        productId: '', 
        quantity: 0, 
        unitPrice: 0, 
        paymentType: 'CASH', 
        paidAmount: 0, 
        dueDate: format(new Date(), 'yyyy-MM-dd') 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSales = sales.filter(s => 
    s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.wholesalerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesaler Sales</h1>
          <p className="text-slate-500">Manage bulk orders, profits and credit history</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          New Sale Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search wholesaler or product..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSales.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-6">
            <div className="flex items-center gap-4 min-w-[250px]">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                s.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 
                s.status === 'OVERDUE' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              )}>
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg leading-tight">{s.wholesalerName}</div>
                <div className="text-sm text-slate-500 font-medium">{s.productName} × {s.quantity}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
               <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Amount</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight">₨ {s.totalPrice.toLocaleString()}</div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Net Profit</div>
                  <div className="text-lg font-bold text-emerald-600 tracking-tight">+ ₨ {s.profit?.toLocaleString() || 0}</div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Payment</div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    {s.paymentType === 'CASH' ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {s.paymentType}
                  </div>
                  <div className="text-xs text-slate-500 italic">Remaining: ₨ {s.remainingAmount.toLocaleString()}</div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Status</div>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight",
                    s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                    s.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700 outline outline-rose-200 animate-pulse' : 'bg-amber-100 text-amber-700'
                  )}>
                    {s.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {s.status}
                  </div>
                  {s.remainingAmount > 0 && <div className="text-xs text-slate-400 font-medium">Due: {s.dueDate}</div>}
               </div>
            </div>

            <div className="flex items-center gap-2 xl:border-l xl:pl-6 border-slate-100">
               <button className="flex-1 xl:flex-none px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-md">
                  Update Payment
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sale Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Wholesale Sale</h2>
                  <p className="text-slate-500 text-sm">Calculate profit and record credit terms</p>
                </div>
                <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleAddSale} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Wholesaler</label>
                    <select 
                      required
                      value={newSale.wholesalerId}
                      onChange={(e) => setNewSale({...newSale, wholesalerId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    >
                      <option value="">Select Wholesaler...</option>
                      {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Product</label>
                    <select 
                      required
                      value={newSale.productId}
                      onChange={(e) => setNewSale({...newSale, productId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                    <input 
                      required
                      type="number" 
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({...newSale, quantity: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selling Price (Per Unit)</label>
                    <input 
                      required
                      type="number" 
                      value={newSale.unitPrice}
                      onChange={(e) => setNewSale({...newSale, unitPrice: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Type</label>
                    <div className="flex gap-2">
                       <button 
                        type="button" 
                        onClick={() => setNewSale({...newSale, paymentType: 'CASH'})}
                        className={cn("flex-1 py-3 rounded-2xl font-bold border transition-all", newSale.paymentType === 'CASH' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400')}
                       >Cash</button>
                       <button 
                        type="button"
                        onClick={() => setNewSale({...newSale, paymentType: 'CREDIT'})}
                        className={cn("flex-1 py-3 rounded-2xl font-bold border transition-all", newSale.paymentType === 'CREDIT' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400')}
                       >Credit</button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Paid Amount</label>
                    <input 
                      type="number" 
                      value={newSale.paidAmount}
                      onChange={(e) => setNewSale({...newSale, paidAmount: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {newSale.paymentType === 'CREDIT' && (
                   <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> Payment Due Date
                    </label>
                    <input 
                      type="date" 
                      value={newSale.dueDate}
                      onChange={(e) => setNewSale({...newSale, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                )}

                <div className="bg-slate-950 p-6 rounded-3xl flex justify-between items-center shadow-inner">
                   <div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Invoice</div>
                     <div className="text-3xl font-black text-white font-mono tracking-tighter">₨ {(newSale.quantity * newSale.unitPrice).toLocaleString()}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expected Profit</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">+ ₨ {((newSale.unitPrice - (products.find(p => p.id === newSale.productId)?.averageCost || 0)) * newSale.quantity).toLocaleString()}</div>
                   </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]">
                    Record Transaction
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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
