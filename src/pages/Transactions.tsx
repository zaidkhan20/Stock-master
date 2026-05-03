import React, { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { Transaction, Product } from '../types';
import { format } from 'date-fns';
import { orderBy, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Search, 
  Activity, 
  Terminal, 
  Hash, 
  Clock, 
  User as UserIcon,
  Filter,
  Download
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { data: transactions, loading } = useCollection<Transaction>('transactions', [orderBy('timestamp', 'desc'), limit(100)]);
  const { data: products } = useCollection<Product>('products');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    const product = products.find(p => p.id === tx.productId);
    const searchStr = `${tx.productId} ${tx.note} ${product?.name} ${product?.sku} ${tx.userName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getProductName = (id: string) => {
    const product = products.find(p => p.id === id);
    return product ? product.name : `REF_ID: ${id.substring(0, 8)}...`;
  };

  const getProductSKU = (id: string) => {
    const product = products.find(p => p.id === id);
    return product ? product.sku : 'UNKNOWN_SKU';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-slate-950 pl-6 py-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">System Telemetry</h1>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Activity size={12} className="text-zinc-400" /> 
            Real-time Audit Log: {filteredTransactions.length} Handled Events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Download size={14} />
            Dump Log
          </button>
        </div>
      </header>

      {/* Control Strip */}
      <div className="bg-white border border-zinc-200 p-3 rounded-sm flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-slate-950 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="SCAN TELEMETRY BY PRODUCT, USER, OR NOTE..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-sm pl-9 pr-4 py-2 text-[10px] font-mono uppercase tracking-tight focus:ring-1 focus:ring-slate-950/10 focus:border-slate-950 outline-none transition-all placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-zinc-200 rounded text-zinc-400 hover:text-slate-950 transition-colors">
            <Filter size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Temporal_Marker</th>
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest text-center">Type_Vector</th>
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Asset_Origin</th>
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest text-center">Delta</th>
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Final_State</th>
                <th className="px-4 py-3 text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Operator & Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-sans">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-slate-950">
                        {tx.timestamp?.toDate ? format(tx.timestamp.toDate(), 'yy.MM.dd') : '--.--.--'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {tx.timestamp?.toDate ? format(tx.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-tighter border",
                        tx.type === 'IN' ? "bg-green-50 text-green-700 border-green-200" : 
                        tx.type === 'OUT' ? "bg-red-50 text-red-700 border-red-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}>
                        {tx.type === 'IN' ? <ArrowUpRight size={10} /> : 
                         tx.type === 'OUT' ? <ArrowDownRight size={10} /> : <RefreshCcw size={10} />}
                        {tx.type === 'IN' ? 'RECEIVE' : tx.type === 'OUT' ? 'DISPATCH' : 'ADJUST'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-tight text-slate-950 truncate max-w-[150px]">
                        {getProductName(tx.productId)}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                        SKU: {getProductSKU(tx.productId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "text-[12px] font-mono font-black",
                      tx.type === 'IN' ? "text-green-600" : tx.type === 'OUT' ? "text-red-600" : "text-slate-950"
                    )}>
                      {tx.type === 'OUT' ? '-' : '+'}{tx.quantity.toString().padStart(3, '0')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-zinc-300">{tx.previousStock.toString().padStart(3, '0')}</span>
                      <span className="text-zinc-200 px-1">»</span>
                      <span className="text-slate-950 font-bold">{tx.currentStock.toString().padStart(3, '0')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 uppercase tracking-tight">
                         <UserIcon size={10} className="text-zinc-400" />
                         {tx.userName || 'SYSTEM_AUTH'}
                       </div>
                       <p className="text-[10px] text-zinc-400 truncate max-w-[200px] mt-0.5 italic">"{(tx.note || 'NO_METADATA_PROVIDED').toUpperCase()}"</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <div className="w-8 h-8 border-2 border-zinc-200 border-t-slate-950 rounded-full animate-spin" />
               <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Decrypting Telemetry...</span>
            </div>
          )}
          
          {!loading && filteredTransactions.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <Terminal size={32} className="text-zinc-200" />
               <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Zero events matched current filter</p>
                  <p className="text-[10px] font-mono text-zinc-200 px-4 py-1 bg-zinc-50 rounded">LOG_STATUS: EMPTY_SET</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
