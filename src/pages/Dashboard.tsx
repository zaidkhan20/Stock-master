import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-lg bg-opacity-10", color)}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn("text-xs font-bold flex items-center gap-0.5", trend > 0 ? "text-emerald-600" : "text-rose-600")}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="text-slate-500 text-sm font-medium">{title}</div>
    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
  </motion.div>
);

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    lowStock: 0,
    pendingPayments: 0
  });

  const chartData = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Real-time business performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-full">
          Currency: <span className="text-slate-900 font-bold">PKR (₨)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Monthly Revenue" 
          value="₨ 482,000" 
          icon={TrendingUp} 
          trend={12.5} 
          color="bg-slate-900" 
        />
        <StatCard 
          title="Monthly Profit" 
          value="₨ 124,500" 
          icon={TrendingUp} 
          trend={8.2} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Critical Stock" 
          value="14 Items" 
          icon={AlertTriangle} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Wholesaler Debts" 
          value="₨ 210,000" 
          icon={CreditCard} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">Sales vs Profit Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `₨${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0f172a" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={0} 
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">Top Wholesalers</h2>
          <div className="space-y-4 flex-1">
            {[
              { name: 'Lahore Trading Co.', total: 120000, debt: 45000 },
              { name: 'Al-Madina General Store', total: 95000, debt: 0 },
              { name: 'Fast Distribution', total: 82000, debt: 20000 },
              { name: 'Khyber Wholesalers', total: 65000, debt: 15000 },
            ].map((customer, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{customer.name}</div>
                  <div className="text-xs text-slate-500">Sales: ₨{customer.total.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={cn("text-xs font-bold", customer.debt > 0 ? "text-amber-600" : "text-emerald-600")}>
                    {customer.debt > 0 ? `Debt: ₨${customer.debt.toLocaleString()}` : 'Cleared'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 text-sm font-bold text-slate-900 border-t border-slate-100 mt-4 hover:bg-slate-50 transition-colors">
            View All Wholesalers
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Inventory Actions</h2>
          <button className="text-sm font-bold text-slate-900 hover:underline">View History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { item: 'Steel Rods 12mm', action: 'Purchase', qty: '+500', user: 'Zaid (Admin)', time: '10 mins ago' },
                { item: 'Cement Bags (OPC)', action: 'Sale', qty: '-120', user: 'Ahmed (Staff)', time: '45 mins ago' },
                { item: 'Paint Buckets 20L', action: 'Adjustment', qty: '-2', user: 'Zaid (Admin)', time: '2 hours ago' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.item}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                      row.action === 'Purchase' ? 'bg-emerald-100 text-emerald-700' : 
                      row.action === 'Sale' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'
                    )}>
                      {row.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{row.qty}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{row.user}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm text-right">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
