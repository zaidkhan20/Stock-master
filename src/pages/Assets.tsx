import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Factory, 
  Plus, 
  Target, 
  PiggyBank, 
  Calendar,
  X,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  id: string;
  name: string;
  estimatedCost: number;
  savedAmount: number;
  targetDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PLANNING' | 'SAVING' | 'ACQUIRED';
}

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    estimatedCost: 0,
    targetDate: '',
    priority: 'MEDIUM' as const
  });

  useEffect(() => {
    return onSnapshot(query(collection(db, 'assets')), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)));
    });
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'assets'), {
        ...newAsset,
        savedAmount: 0,
        status: 'PLANNING',
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewAsset({ name: '', estimatedCost: 0, targetDate: '', priority: 'MEDIUM' });
    } catch (err) {
      console.error(err);
    }
  };

  const calculateProgress = (saved: number, total: number) => {
    return Math.min(Math.round((saved / total) * 100), 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Future Asset Planning</h1>
          <p className="text-slate-500">Strategic saving for business machinery and equipment</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          Add Planning Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <motion.div 
            key={asset.id}
            layout
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform">
                <Factory className="w-7 h-7" />
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                asset.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                asset.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              )}>
                {asset.priority} Priority
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{asset.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Target: {asset.targetDate || 'Not set'}
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Saving Progress</div>
                  <div className="text-sm font-black text-slate-900">{calculateProgress(asset.savedAmount, asset.estimatedCost)}%</div>
               </div>
               <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(asset.savedAmount, asset.estimatedCost)}%` }}
                    className="h-full bg-slate-900"
                  />
               </div>
               <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400">Saved</div>
                    <div className="font-mono font-bold text-slate-900">₨ {asset.savedAmount.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-slate-400">Total Goal</div>
                    <div className="font-mono font-bold text-slate-900">₨ {asset.estimatedCost.toLocaleString()}</div>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-3">
               <button className="py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                 Manage Goal
               </button>
               <button className="py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                 <Plus className="w-4 h-4" />
                 Add Savings
               </button>
            </div>
          </motion.div>
        ))}
        {assets.length === 0 && (
           <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Asset Plans Yet</h3>
              <p className="text-slate-500 max-w-xs mt-1">Start planning for future machines and business expansion tools.</p>
           </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">New Asset Goal</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleAddAsset} className="p-8 space-y-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Hydraulic Press"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">One-time Estimated Cost (PKR)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0.00"
                    value={newAsset.estimatedCost}
                    onChange={(e) => setNewAsset({...newAsset, estimatedCost: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none text-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Date</label>
                    <input 
                      type="date" 
                      value={newAsset.targetDate}
                      onChange={(e) => setNewAsset({...newAsset, targetDate: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                    <select 
                      value={newAsset.priority}
                      onChange={(e) => setNewAsset({...newAsset, priority: e.target.value as any})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]">
                  Initialize Planning
                </button>
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
