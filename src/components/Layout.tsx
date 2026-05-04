import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Settings, 
  ClipboardList, 
  Factory, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NavLink = ({ to, icon: Icon, children, collapsed }: { to: string, icon: any, children: React.ReactNode, collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
        isActive 
          ? "bg-slate-900 text-white" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900")} />
      {!collapsed && <span className="font-medium">{children}</span>}
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<any>({});
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!db) return;
    return onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
    });
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex transition-colors duration-300",
      config.darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r transition-all duration-300 h-full",
          collapsed ? "w-20" : "w-64",
          config.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 font-bold text-xl">
              {config.logoURL ? (
                <img src={config.logoURL} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
              ) : (
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs">SM</div>
              )}
              <span className={config.darkMode ? "text-white" : "text-slate-900"}>{config.businessName || 'Stock Master'}</span>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("p-1 rounded-md", config.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className={cn("flex-1 px-3 py-4 space-y-1", config.compactView && "space-y-0.5 py-2")}>
          <NavLink to="/" icon={BarChart3} collapsed={collapsed}>Dashboard</NavLink>
          <NavLink to="/inventory" icon={Package} collapsed={collapsed}>Inventory</NavLink>
          <NavLink to="/purchases" icon={ShoppingCart} collapsed={collapsed}>Purchases</NavLink>
          <NavLink to="/sales" icon={Truck} collapsed={collapsed}>Sales</NavLink>
          <NavLink to="/suppliers" icon={ClipboardList} collapsed={collapsed}>Suppliers</NavLink>
          <NavLink to="/wholesalers" icon={Users} collapsed={collapsed}>Wholesalers</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/employees" icon={Users} collapsed={collapsed}>Employees</NavLink>
              <NavLink to="/assets" icon={Factory} collapsed={collapsed}>Asset Planning</NavLink>
            </>
          )}
        </nav>

        <div className={cn("p-3 border-t", config.darkMode ? "border-slate-800" : "border-slate-200")}>
          <NavLink to="/settings" icon={Settings} collapsed={collapsed}>Settings</NavLink>
          <button
            onClick={() => auth.signOut()}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors group",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Trigger */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white">
          <div className="p-6 h-full flex flex-col">
            <div className="font-bold text-2xl text-slate-900 mb-8 flex items-center gap-2">
               <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm">SM</div>
               Stock Master
            </div>
            <nav className="flex-1 space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 bg-slate-50 rounded-xl">Dashboard</Link>
              <Link to="/inventory" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Inventory</Link>
              <Link to="/purchases" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Purchases</Link>
              <Link to="/sales" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Sales</Link>
              <Link to="/suppliers" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Suppliers</Link>
              <Link to="/wholesalers" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Wholesalers</Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Settings</Link>
            </nav>
            <button
               onClick={() => auth.signOut()}
               className="w-full p-4 mt-4 text-center font-bold text-red-600 bg-red-50 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <main 
        className="flex-1 min-h-screen overflow-y-auto overflow-x-hidden p-4 md:p-8 relative"
        onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between uppercase text-[10px] tracking-widest text-slate-400 font-bold mb-4">
          <span>{location.pathname === '/' ? 'System Overview' : location.pathname.substring(1)}</span>
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node Active</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
