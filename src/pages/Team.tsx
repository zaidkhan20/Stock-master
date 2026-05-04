import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Mail, 
  Clock, 
  MoreVertical, 
  Search, 
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Trash2,
  Edit2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { UserProfile, UserRole } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export const Team: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const { data: team, loading } = useCollection<UserProfile>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeam = team.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    if (!isAdmin || !db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch(role) {
      case UserRole.ADMIN: return <ShieldCheck size={14} className="text-slate-950" />;
      case UserRole.STAFF: return <ShieldAlert size={14} className="text-zinc-500" />;
      default: return <Eye size={14} className="text-zinc-400" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case UserRole.ADMIN: return "bg-slate-950 text-white";
      case UserRole.STAFF: return "bg-zinc-100 text-zinc-900";
      default: return "bg-zinc-50 text-zinc-500 border border-zinc-100";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-slate-950 pl-6 py-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">Operator Network</h1>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Users size={12} className="text-zinc-400" /> 
            Active Node Count: {team.length}
          </p>
        </div>
        {isAdmin && (
          <button className="h-10 px-4 rounded border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={14} />
            Invite Node
          </button>
        )}
      </header>

      {/* Control Strip */}
      <div className="bg-white border border-zinc-200 p-4 rounded-sm">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="FILTER BY OPERATOR NAME OR UID..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-sm pl-10 pr-4 py-2 text-[11px] font-mono uppercase tracking-tight focus:ring-1 focus:ring-slate-950/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Operator_Identity</th>
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Clearance_Level</th>
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Connectivity</th>
              <th className="p-4 text-left text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Registry_Log</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {filteredTeam.map((user) => (
              <tr key={user.id} className="group hover:bg-zinc-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                      alt="" 
                      className="w-9 h-9 rounded-sm border border-zinc-200"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight text-slate-950">{user.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400 lowercase">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                      getRoleColor(user.role)
                    )}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                    {isAdmin && user.id !== profile?.id && (
                       <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                        className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer text-zinc-400 hover:text-slate-950 transition-colors"
                      >
                        {Object.values(UserRole).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Active_Node</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                      JOINED_EPOCH: {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'yy.MM.dd') : 'LEGACY'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <button 
                        onClick={async () => {
                          const isSelf = user.id === profile?.id;
                          const msg = isSelf 
                            ? `WARNING: PURGING YOUR OWN IDENTITY (${user.email}). YOU WILL BE INSTANTLY LOGGED OUT AND YOUR RECORD REMOVED. PROCEED?`
                            : `PERMANENTLY REMOVE NODE: ${user.email}? THIS ACTION IS IRREVERSIBLE.`;
                          
                          if (window.confirm(msg)) {
                            try {
                              await deleteDoc(doc(db, 'users', user.id));
                              if (isSelf) {
                                alert("IDENTITY PURGED. TERMINATING SESSION.");
                                await auth.signOut();
                              }
                            } catch (err) {
                              handleFirestoreError(err, OperationType.DELETE, `users/${user.id}`);
                            }
                          }
                        }}
                        className={cn(
                          "p-2 transition-all rounded",
                          user.id === profile?.id ? "text-rose-600 hover:bg-rose-100" : "text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        )}
                        title={user.id === profile?.id ? "Self-Purge Identity" : "Decommission Node"}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className="p-2 text-zinc-400 hover:text-slate-950 hover:bg-zinc-200 transition-all rounded">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-2 border-zinc-200 border-t-slate-950 rounded-full animate-spin" />
             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Scanning Network Nodes...</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-slate-950 p-6 rounded-sm text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
               <Lock size={24} />
             </div>
             <div>
               <h3 className="text-sm font-black uppercase tracking-tight">Security Protocol Enforcement</h3>
               <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-widest font-mono">Permission inheritance is strictly hierarchical.</p>
             </div>
           </div>
           <button className="h-10 px-6 bg-white text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all rounded">
             Review Access Logs
           </button>
        </div>
      )}
    </div>
  );
};
