import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  Plus, 
  Search, 
  CreditCard, 
  Phone, 
  Mail, 
  MoreVertical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Wholesaler {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalDebt: number;
}

export const Wholesalers: React.FC = () => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newWholesaler, setNewWholesaler] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    return onSnapshot(query(collection(db, 'wholesalers')), (snapshot) => {
      setWholesalers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wholesaler)));
    });
  }, []);

  const handleAddWholesaler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'wholesalers'), {
        ...newWholesaler,
        totalDebt: 0,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewWholesaler({ name: '', phone: '', email: '', address: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesaler Network</h1>
          <p className="text-slate-500">Track regular bulk customers and outstanding balances</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Register Wholesaler
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search wholesalers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="space-y-4">
        {wholesalers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map((w) => (
          <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all group">
             <div className="flex items-center gap-4 min-w-[300px]">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-900 leading-tight">{w.name}</h3>
                   <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {w.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {w.email}</span>
                   </div>
                </div>
             </div>

             <div className="flex-1 grid grid-cols-2 md:grid-cols-1 gap-6">
                <div>
                   <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Current Balance</div>
                   <div className={cn("text-xl font-black font-mono tracking-tighter", w.totalDebt > 0 ? "text-rose-600" : "text-emerald-600")}>
                      ₨ {w.totalDebt.toLocaleString()}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100 text-slate-900 text-xs font-black uppercase rounded-xl hover:bg-slate-200 transition-all">
                   View History
                </button>
                <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800 transition-all shadow-md">
                   Receive Payment
                </button>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Register Wholesaler</h2>
                  <button onClick={() => setShowAddModal(false)}><X /></button>
               </div>
               <form onSubmit={handleAddWholesaler} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Company Name</label>
                    <input required placeholder="e.g. Lahore Traders" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newWholesaler.name} onChange={e => setNewWholesaler({...newWholesaler, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Phone</label>
                      <input placeholder="+92 ..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newWholesaler.phone} onChange={e => setNewWholesaler({...newWholesaler, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Email</label>
                      <input placeholder="email@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={newWholesaler.email} onChange={e => setNewWholesaler({...newWholesaler, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Address</label>
                    <textarea placeholder="Delivery address..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold resize-none" rows={3} value={newWholesaler.address} onChange={e => setNewWholesaler({...newWholesaler, address: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl">Complete Registration</button>
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
