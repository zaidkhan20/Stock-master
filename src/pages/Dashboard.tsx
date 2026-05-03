import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Activity,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { Product, Transaction } from '../types';
import { format } from 'date-fns';
import { orderBy, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  secondary?: string;
  icon: React.ReactNode; 
  trend?: string; 
  trendUp?: boolean 
}> = ({ title, value, secondary, icon, trend, trendUp }) => (
  <div className="bg-white p-5 border border-zinc-200 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex flex-col justify-between h-32 relative overflow-hidden group">
    <div className="flex justify-between items-start z-10">
      <div className="text-zinc-400 group-hover:text-slate-950 transition-colors">
        {icon}
      </div>
      {trend && (
        <div className={cn(
          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-tighter flex items-center gap-0.5",
          trendUp ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      )}
    </div>
    <div className="z-10">
      <h3 className="text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-mono font-bold tracking-tighter text-slate-950 leading-none">{value}</p>
        {secondary && <span className="text-[10px] font-mono text-zinc-400">{secondary}</span>}
      </div>
    </div>
    <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
       {icon}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { data: products } = useCollection<Product>('products');
  const { data: recentTransactions } = useCollection<Transaction>('transactions', [orderBy('timestamp', 'desc'), limit(10)]);

  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const totalCostValue = products.reduce((acc, p) => acc + ((p.costPrice || p.price * 0.7) * p.quantity), 0);
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock && p.quantity > 0);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  const chartData = products.slice(0, 8).map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
    stock: p.quantity,
    min: p.minStock
  }));

  // Mock activity data for the sparkline feel
  const activityData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 1000 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-l-4 border-slate-950 pl-6 py-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">System Overview</h1>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Activity size={12} className="text-green-500" /> 
            Real-time Inventory Nodes: {products.length}
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
           <div className="hidden sm:block">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none">Timestamp</p>
              <p className="font-mono text-xs font-bold mt-1 text-slate-950">{format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
           </div>
           <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-serif italic text-zinc-400">Inventory Status</span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-sm mt-1 uppercase tracking-widest",
                outOfStockProducts.length > 0 ? "bg-red-950 text-white" : "bg-green-100 text-green-800"
              )}>
                {outOfStockProducts.length > 0 ? 'CRITICAL_ALERTS_ACTIVE' : 'NOMINAL_OPERATIONS'}
              </span>
           </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Global Asset Count" 
          value={products.reduce((acc, p) => acc + p.quantity, 0)} 
          secondary="UNITS"
          icon={<Package size={16} />} 
          trend="+2.4%"
          trendUp={true}
        />
        <MetricCard 
          title="Estimated Net Value" 
          value={`$${totalStockValue.toLocaleString()}`} 
          secondary="USD"
          icon={<Zap size={16} />} 
          trend="+14.1%"
          trendUp={true}
        />
        <MetricCard 
          title="Threshold Infractions" 
          value={lowStockProducts.length} 
          secondary="SKUs"
          icon={<ShieldAlert size={16} />} 
          trend="-1"
          trendUp={false}
        />
        <MetricCard 
          title="Depleted Inventory" 
          value={outOfStockProducts.length} 
          secondary="SKUs"
          icon={<AlertCircle size={16} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics View */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-sm p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} />
              Operational Throughput
            </h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-950 rounded-full" />
                  <span className="text-[10px] font-mono text-zinc-400">CURRENT_LEVELS</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-zinc-200 rounded-full" />
                  <span className="text-[10px] font-mono text-zinc-400">MIN_THRESHOLD</span>
               </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono'}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono'}} 
                />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}} 
                  contentStyle={{
                    borderRadius: '0px', 
                    border: '1px solid #e4e4e7', 
                    boxShadow: 'none',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono'
                  }}
                />
                <Bar dataKey="stock" fill="#020617" />
                <Bar dataKey="min" fill="#e4e4e7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-3 gap-6">
             <div>
                <p className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Efficiency</p>
                <p className="text-xs font-mono font-bold mt-1">94.2%</p>
             </div>
             <div>
                <p className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Turnover Rate</p>
                <p className="text-xs font-mono font-bold mt-1">12.5x / YR</p>
             </div>
             <div>
                <p className="text-[9px] font-serif italic text-zinc-400 uppercase tracking-widest">Storage CAP</p>
                <p className="text-xs font-mono font-bold mt-1">821 / 1000m²</p>
             </div>
          </div>
        </div>

        {/* System Activity Log */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6 flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-8">
            <Terminal size={14} />
            Telemetry Log
          </h2>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex gap-3 group border-b border-zinc-50 pb-4 last:border-0">
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold",
                  tx.type === 'IN' ? "bg-green-50 text-green-700 border border-green-100" : 
                  tx.type === 'OUT' ? "bg-red-50 text-red-700 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                )}>
                  {tx.type === 'IN' ? 'INC' : tx.type === 'OUT' ? 'DEC' : 'ADJ'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-950 uppercase tracking-tight truncate max-w-[100px]">
                      {tx.productName || tx.productId.slice(0, 8)}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {tx.timestamp?.toDate ? format(tx.timestamp.toDate(), 'HH:mm') : 'NOW'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    {tx.type === 'OUT' ? '-' : '+'}{tx.quantity} UNITS | BAL: {tx.currentStock}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="py-20 text-center text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
                No telemetry recorded
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-3 text-[10px] font-bold text-zinc-400 hover:text-slate-950 transition-colors uppercase tracking-widest border border-zinc-100 rounded-sm">
            Access Full Archive
          </button>
        </div>
      </div>

      {/* Critical Alerts Strip */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-950 text-white p-4 flex items-center justify-between rounded-sm overflow-hidden relative">
          <div className="flex items-center gap-4 z-10">
             <AlertCircle size={20} className="text-red-500 animate-pulse" />
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Critical Inventory Depletion Detected</p>
                <p className="text-[11px] opacity-70 font-mono tracking-tight">System identified {outOfStockProducts.length} null-level SKUs requiring immediate restock protocol.</p>
             </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 transition-all px-4 py-2 text-[10px] font-bold uppercase tracking-widest z-10 border border-white/20">
             Execute Procurement
          </button>
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-red-500/20 to-transparent" />
        </div>
      )}
    </div>
  );
};

import { Terminal } from 'lucide-react';
