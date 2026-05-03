/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Transactions } from './pages/Transactions';
import { Suppliers } from './pages/Suppliers';
import { Team } from './pages/Team';
import { Login } from './pages/Login';
import { isFirebaseConfigured } from './lib/firebase';
import { AlertTriangle, Loader2, Terminal } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-slate-950 rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest animate-pulse">Initializing System State...</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'transactions': return <Transactions />;
      case 'suppliers': return <Suppliers />;
      case 'team': return <Team />;
      case 'settings': return (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-lg bg-white">
          <Terminal size={32} className="text-zinc-200 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-300">System Configuration Pending</h2>
          <p className="text-[10px] font-mono text-zinc-300 uppercase mt-2">Module: CONFIG_REDACTED</p>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
