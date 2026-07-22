import React from 'react';
import type { Product, CartItem } from '../types';
import { StoreFront } from './StoreFront';
import { LayoutGrid } from 'lucide-react';

interface SplitDemoViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, storeId: 'store1' | 'store2') => void;
}

export const SplitDemoView: React.FC<SplitDemoViewProps> = ({
  products,
  cart,
  onAddToCart,
}) => {
  return (
    <div className="space-y-6 pb-16">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-gray-950 to-gray-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">Split-Screen Live Synchronization Simulator</h2>
              <span className="bg-amber-500 text-gray-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Interactive Test
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Side-by-Side Dual Store View. Click <span className="text-emerald-400 font-bold">"Add to Cart"</span> or buy an item in Store 1 (left) and watch the available stock automatically decrement in Store 2 (right) in real time!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 sync-dot inline-block" />
          <span>BroadcastChannel Event Stream Active</span>
        </div>
      </div>

      {/* Side by side dual grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Store 1 */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-gray-950/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-bold text-emerald-400">Store Alpha (Downtown Outlet)</h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Store ID: store1</span>
          </div>

          <StoreFront
            storeId="store1"
            products={products}
            cart={cart}
            onAddToCart={(p) => onAddToCart(p, 'store1')}
            otherStoreName="Store Beta"
          />
        </div>

        {/* Right Side: Store 2 */}
        <div className="glass-panel rounded-3xl p-6 border border-violet-500/30 bg-gray-950/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-violet-500" />
              <h3 className="text-lg font-bold text-violet-400">Store Beta (Uptown Hub)</h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Store ID: store2</span>
          </div>

          <StoreFront
            storeId="store2"
            products={products}
            cart={cart}
            onAddToCart={(p) => onAddToCart(p, 'store2')}
            otherStoreName="Store Alpha"
          />
        </div>

      </div>

    </div>
  );
};
