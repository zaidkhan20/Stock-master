import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  Settings as SettingsIcon, 
  UserCog, 
  Building2, 
  Image as ImageIcon,
  ShieldCheck,
  Save,
  Palette,
  Briefcase,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

export const Settings: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ROLES'>('GENERAL');
  
  const [config, setConfig] = useState({
    businessName: 'Stock Master Pro',
    currency: 'PKR',
    logoURL: '',
    lowStockThreshold: 10
  });

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setConfig(prev => ({ ...prev, ...doc.data() }));
      }
    });

    if (isAdmin) {
      onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [isAdmin]);

  const handleSaveGeneral = async () => {
    try {
      await setDoc(doc(db, 'settings', 'config'), config, { merge: true });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Configure business branding and user permissions</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-200 w-fit rounded-xl">
        <button 
          onClick={() => setActiveTab('GENERAL')}
          className={cn("px-6 py-2.5 rounded-lg text-sm font-black uppercase transition-all", activeTab === 'GENERAL' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          General
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('ROLES')}
            className={cn("px-6 py-2.5 rounded-lg text-sm font-black uppercase transition-all", activeTab === 'ROLES' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            User Roles
          </button>
        )}
      </div>

      {activeTab === 'GENERAL' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-slate-900" />
                <h2 className="text-xl font-bold text-slate-900">Business Identity</h2>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                <input 
                  type="text" 
                  value={config.businessName}
                  onChange={(e) => setConfig({...config, businessName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Branding Logo URL</label>
                <div className="flex gap-4">
                   <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                      {config.logoURL ? <img src={config.logoURL} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-slate-400" />}
                   </div>
                   <input 
                    type="text" 
                    placeholder="https://..."
                    value={config.logoURL}
                    onChange={(e) => setConfig({...config, logoURL: e.target.value})}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Currency Symbol</label>
                    <input 
                      type="text" 
                      value={config.currency}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Auto-Forecast Threshold</label>
                    <input 
                      type="number" 
                      value={config.lowStockThreshold}
                      onChange={(e) => setConfig({...config, lowStockThreshold: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900"
                    />
                 </div>
              </div>

              <button 
                onClick={handleSaveGeneral}
                className="w-full py-4 mt-6 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                <Save className="w-5 h-5" />
                Commit Configuration
              </button>
           </div>

           <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl text-white">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold">Admin Privileges</h2>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed mb-6">
                   Your account has <span className="text-emerald-400 font-bold">{profile?.role}</span> status. 
                   You can manage inventory, process wholesale sales, and view staff performance.
                 </p>
                 <div className="space-y-3">
                   {['Full Database Access', 'Role Assignment', 'Financial Reporting', 'Future Asset Planning'].map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        {p}
                      </div>
                   ))}
                 </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200">
                 <div className="flex items-center gap-3 mb-4">
                    <Palette className="w-6 h-6 text-slate-900" />
                    <h2 className="text-xl font-bold text-slate-900">Personalization</h2>
                 </div>
                 <p className="text-slate-500 text-sm mb-6">Tailor your interface experience for maximum productivity.</p>
                 <div className="flex flex-col gap-3">
                    <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                       <span className="font-bold text-slate-700">Dark Mode</span>
                       <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                       </div>
                    </button>
                    <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                       <span className="font-bold text-slate-700">Compact View</span>
                       <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                       </div>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5">Access Email</th>
                  <th className="px-8 py-5">Assigned Role</th>
                  <th className="px-8 py-5 text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                   <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                               {u.name?.charAt(0) || u.email?.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{u.name || 'Incognito User'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-slate-600 font-medium">{u.email}</td>
                      <td className="px-8 py-5">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                           u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 
                           u.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                         )}>
                           {u.role}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <select 
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                         >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                         </select>
                      </td>
                   </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

