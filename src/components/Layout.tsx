import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus,
  Box,
  Truck,
  Users,
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  active: boolean;
  onClick: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, id, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm group",
      active 
        ? "bg-slate-950 text-white shadow-sm" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-slate-950"
    )}
  >
    <span className={cn(
      "transition-colors",
      active ? "text-white" : "text-zinc-400 group-hover:text-slate-950"
    )}>
      {icon}
    </span>
    <span className="font-medium tracking-tight">{label}</span>
    {active && (
      <motion.div 
        layoutId="activeNavIndicator" 
        className="ml-auto w-1 h-4 bg-white/40 rounded-full"
      />
    )}
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode, activePage: string, onPageChange: (page: string) => void }> = ({ 
  children, 
  activePage, 
  onPageChange 
}) => {
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Box size={18} /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck size={18} /> },
    { id: 'team', label: 'Team', icon: <Users size={18} /> },
    { id: 'transactions', label: 'Audit Log', icon: <History size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const handleLogout = () => auth?.signOut();

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-950 font-sans flex overflow-hidden h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center text-white shadow-inner">
            <Terminal size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-tighter leading-none">StockMaster</span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest mt-0.5">V.04.1-BETA</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <span className="text-[10px] font-serif italic opacity-40 px-3 mb-2 block tracking-widest uppercase">Navigation</span>
            <nav className="space-y-1">
              {navItems.slice(0, 5).map((item) => (
                <NavItem 
                  key={item.id} 
                  {...item} 
                  active={activePage === item.id} 
                  onClick={onPageChange}
                />
              ))}
            </nav>
          </div>

          <div>
            <span className="text-[10px] font-serif italic opacity-40 px-3 mb-2 block tracking-widest uppercase">System</span>
            <nav className="space-y-1">
              {navItems.slice(5).map((item) => (
                <NavItem 
                  key={item.id} 
                  {...item} 
                  active={activePage === item.id} 
                  onClick={onPageChange}
                />
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="relative">
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name}`} 
                alt="Avatar" 
                className="w-9 h-9 rounded-md border border-zinc-200"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate leading-none">{profile?.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter mt-1">{profile?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-[11px] font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with status */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
             <button 
              className="md:hidden p-2 text-zinc-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> DB CONNECTED</span>
               <span className="hidden sm:inline opacity-30">|</span>
               <span className="hidden sm:inline">REGION: EU-WEST-2</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="h-8 px-3 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <History size={14} />
                Quick Audit
             </button>
             <button 
               onClick={() => onPageChange('inventory')}
               className="h-8 px-3 rounded bg-slate-950 text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
             >
                <Plus size={14} />
                New Entry
             </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#FBFBFA]">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, filter: 'blur(4px)', y: 4 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(4px)', y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-zinc-200 md:hidden flex flex-col"
            >
               <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal size={18} />
                  <span className="font-black text-sm uppercase tracking-tighter">StockMaster</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.id} 
                    {...item} 
                    active={activePage === item.id} 
                    onClick={(id) => { onPageChange(id); setIsMobileMenuOpen(false); }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
