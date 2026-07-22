import React from 'react';
import type { StoreId } from '../types';
import { ShoppingBag, ShieldCheck, RefreshCw, LayoutGrid, Zap, Store } from 'lucide-react';

interface NavbarProps {
  currentView: StoreId | 'admin' | 'split';
  setCurrentView: (view: StoreId | 'admin' | 'split') => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  cartCount,
  cartTotal,
  onOpenCart,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Sync Status */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setCurrentView('store1')}
              className="cursor-pointer flex items-center space-x-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    OmniSync<span className="text-emerald-400">Stores</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    v2.0 Real-time
                  </span>
                </div>
                <p className="text-xs text-gray-400 hidden sm:block">Dual-Store Synchronized Commerce Engine</p>
              </div>
            </div>

            {/* Live Sync Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 sync-dot inline-block"></span>
              <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
                Shared Inventory Live Sync
              </span>
            </div>
          </div>

          {/* Navigation View Switcher Tabs */}
          <nav className="flex items-center bg-gray-900/90 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
            <button
              onClick={() => setCurrentView('store1')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'store1'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store 1 (Alpha)</span>
            </button>

            <button
              onClick={() => setCurrentView('store2')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'store2'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store 2 (Beta)</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Hub</span>
              <span className="sm:hidden">Admin</span>
            </button>

            <button
              onClick={() => setCurrentView('split')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'split'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
              title="Compare real-time sync side-by-side"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline">Split Live View</span>
            </button>
          </nav>

          {/* Action Buttons: Cart & Demo Reset */}
          <div className="flex items-center space-x-3">
            {/* Demo Data Reset */}
            <button
              onClick={onResetData}
              title="Reset inventory to default sample state"
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Shopping Cart Button */}
            {(currentView === 'store1' || currentView === 'store2') && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 text-gray-950" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-gray-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-extrabold border border-emerald-400/30">
                  {cartCount}
                </span>
                {cartCount > 0 && (
                  <span className="hidden md:inline font-extrabold border-l border-gray-950/20 pl-2">
                    ₱{cartTotal.toLocaleString()}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
