import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  Activity, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  PlusCircle,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { Supplier } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Suppliers: React.FC = () => {
  const { profile, isStaff, isAdmin } = useAuth();
  const { data: suppliers, loading } = useCollection<Supplier>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingSupplier) {
        await updateDoc(doc(db, 'suppliers', editingSupplier.id), data);
      } else {
        await addDoc(collection(db, 'suppliers'), data);
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (err) {
      handleFirestoreError(err, editingSupplier ? OperationType.UPDATE : OperationType.CREATE, 'suppliers');
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !window.confirm('Confirm termination of supplier contract node?')) return;
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `suppliers/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-slate-950 pl-6 py-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">Supplier Matrix</h1>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Truck size={12} className="text-zinc-400" /> 
            Active Procurement Channels: {suppliers.length}
          </p>
        </div>
        {isStaff && (
          <button 
            onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
            className="h-10 px-4 rounded bg-slate-950 text-white hover:bg-zinc-800 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} />
            Onboard Vendor
          </button>
        )}
      </header>

      {/* Control Strip */}
      <div className="bg-white border border-zinc-200 p-4 rounded-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="SCAN VENDOR IDENTITY OR CONTACT..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-sm pl-10 pr-4 py-2.5 text-[11px] font-mono uppercase tracking-tight focus:ring-1 focus:ring-slate-950/10 outline-none transition-all placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier) => (
          <motion.div 
            key={supplier.id}
            layout
            className="bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col group hover:border-slate-950 transition-colors"
          >
            <div className="p-5 flex justify-between items-start border-b border-zinc-50 bg-zinc-50/30">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white border border-zinc-200 rounded flex items-center justify-center text-slate-950 shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-colors">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">{supplier.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest bg-white px-1.5 border border-zinc-100 rounded-sm">ID: {supplier.id.substring(0, 8)}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase bg-green-50 px-1 rounded-sm">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isStaff && (
                  <button 
                    onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                    className="p-1.5 text-zinc-400 hover:text-slate-950 hover:bg-white rounded transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-2 gap-6 flex-1">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Primary Contact</span>
                  <span className="text-[11px] font-bold mt-0.5">{supplier.contactPerson}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Communication Channel</span>
                  <div className="flex flex-col mt-1 space-y-1">
                    <a href={`mailto:${supplier.email}`} className="text-[10px] font-mono text-zinc-600 hover:text-slate-950 flex items-center gap-1.5 truncate">
                      <Mail size={10} /> {supplier.email}
                    </a>
                    <a href={`tel:${supplier.phone}`} className="text-[10px] font-mono text-zinc-600 hover:text-slate-950 flex items-center gap-1.5">
                      <Phone size={10} /> {supplier.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Operational Hub</span>
                  <div className="flex items-start gap-1.5 mt-1">
                    <MapPin size={10} className="text-zinc-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] leading-relaxed text-zinc-500 font-medium">
                      {supplier.address || 'LOC_PENDING'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Reliability Index</span>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} className={cn(i <= 4 ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200")} />
                    ))}
                    <span className="ml-2 text-[9px] font-bold text-zinc-400">4.0 / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                <span className="flex items-center gap-1"><Clock size={10} /> LT: 14D</span>
                <span className="flex items-center gap-1"><Activity size={10} /> RELIABILITY: 98%</span>
              </div>
              <button className="text-[9px] font-bold uppercase tracking-widest text-slate-950 hover:underline flex items-center gap-1">
                View Performance
                <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>
        ))}

        {loading && [1, 2, 3, 4].map(i => (
          <div key={i} className="h-56 bg-zinc-100 animate-pulse rounded-sm border border-zinc-200" />
        ))}
      </div>

      {!loading && filteredSuppliers.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <Terminal size={32} className="text-zinc-200" />
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">No matching vendor signatures</p>
                <p className="text-[10px] font-mono text-zinc-200 uppercase bg-zinc-100 px-3 py-1 rounded">SIG_MATCH: NULL</p>
             </div>
             <button 
               onClick={() => setSearchTerm('')}
               className="mt-2 text-[10px] font-bold text-slate-950 hover:underline underline-offset-4 uppercase tracking-widest"
             >
                Reset Search Buffer
             </button>
          </div>
        )}

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
              className="relative w-full max-w-xl bg-white border border-zinc-200 p-8 shadow-2xl rounded-sm"
            >
              <div className="flex justify-between items-start mb-8 border-l-4 border-slate-950 pl-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Vendor Protocol</h2>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Mode: {editingSupplier ? 'Node_Update' : 'Initialize_Vendor'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Company Name</label>
                    <input 
                      name="name" 
                      required 
                      defaultValue={editingSupplier?.name}
                      placeholder="e.g. GLOBAL LOGISTICS SYSTEMS"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-bold uppercase tracking-tight focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Registry Contact</label>
                    <input 
                      name="contactPerson" 
                      required 
                      defaultValue={editingSupplier?.contactPerson}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-bold uppercase tracking-tight focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Vector</label>
                    <input 
                      name="email" 
                      type="email"
                      required 
                      defaultValue={editingSupplier?.email}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tele-COM Port</label>
                    <input 
                      name="phone" 
                      required 
                      defaultValue={editingSupplier?.phone}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] font-mono focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
                   <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Station Address</label>
                    <input 
                      name="address" 
                      defaultValue={editingSupplier?.address}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-[11px] focus:ring-1 focus:ring-slate-950 outline-none rounded-sm"
                    />
                  </div>
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
                    {editingSupplier ? 'Synchronize' : 'Initialize'}
                    <ChevronRight size={14} />
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
