import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Truck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    return onSnapshot(query(collection(db, 'suppliers')), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...newSupplier,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Directory</h1>
          <p className="text-slate-500">Manage procurement sources and contact information</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((supplier) => (
          <div key={supplier.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <Truck className="w-6 h-6" />
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{supplier.name}</h3>
            <div className="text-sm text-slate-500 mb-4">{supplier.contactPerson}</div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {supplier.phone || 'N/A'}
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {supplier.email || 'N/A'}
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{supplier.address || 'N/A'}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-8">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">New Supplier</h2>
                  <button onClick={() => setShowAddModal(false)}><X /></button>
               </div>
               <form onSubmit={handleAddSupplier} className="space-y-4">
                  <input required placeholder="Business Name" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                  <input placeholder="Contact Person" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newSupplier.contactPerson} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} />
                  <input placeholder="Phone Number" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
                  <input placeholder="Email Address" type="email" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                  <textarea placeholder="Full Address" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none resize-none" rows={3} value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} />
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-all">Save Supplier</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
