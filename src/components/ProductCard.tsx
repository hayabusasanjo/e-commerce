import React, { useState } from 'react';
import type { Product, StoreId } from '../types';
import { ShoppingCart, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  storeId: StoreId;
  onAddToCart: (product: Product) => void;
  cartItemQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  storeId,
  onAddToCart,
  cartItemQuantity,
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const isStore1 = storeId === 'store1';
  const remainingStockInCart = product.stock - cartItemQuantity;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= product.minStockThreshold && !isOutOfStock;

  const accentColorClass = isStore1
    ? 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 shadow-emerald-500/20'
    : 'from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white shadow-violet-500/20';

  const storeBadge = isStore1 ? (
    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center space-x-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sync-dot"></span>
      <span>Store Alpha Sync</span>
    </span>
  ) : (
    <span className="bg-violet-950/80 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center space-x-1">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 sync-dot"></span>
      <span>Store Beta Sync</span>
    </span>
  );

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group relative">
        
        {/* Product Image & Badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {storeBadge}
            <span className="bg-gray-900/90 backdrop-blur-md text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-700/60">
              {product.category}
            </span>
          </div>

          {/* Quick View trigger */}
          <button
            onClick={() => setShowDetail(true)}
            className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 backdrop-blur-md border border-gray-700/50 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            title="Quick view product details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Product Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1 font-mono">
              <span>SKU: {product.sku}</span>
              {cartItemQuantity > 0 && (
                <span className="text-emerald-400 font-semibold">
                  {cartItemQuantity} in cart
                </span>
              )}
            </div>

            <h3 
              onClick={() => setShowDetail(true)}
              className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors cursor-pointer line-clamp-1"
            >
              {product.name}
            </h3>

            <p className="text-xs text-gray-400 line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>

          {/* Synchronized Stock Status Indicator */}
          <div className="pt-2 border-t border-gray-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-black tracking-tight text-white">
                ₱{product.price.toLocaleString()}
              </span>

              {/* Stock Status Badge */}
              {isOutOfStock ? (
                <span className="flex items-center space-x-1 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Out of Stock</span>
                </span>
              ) : isLowStock ? (
                <span className="flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Only {product.stock} left!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{product.stock} In Stock</span>
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock || remainingStockInCart <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.98] ${
                isOutOfStock || remainingStockInCart <= 0
                  ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed shadow-none'
                  : `bg-gradient-to-r ${accentColorClass}`
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? 'Sold Out'
                  : remainingStockInCart <= 0
                  ? 'Max Stock in Cart'
                  : 'Add to Cart'}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Quick View Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden border border-gray-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover" />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                      {product.sku}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                      {product.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{product.description}</p>
                </div>

                <div className="space-y-4 border-t border-gray-800 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">₱{product.price.toLocaleString()}</span>
                    <div className="text-xs font-semibold text-gray-300">
                      Shared Stock: <span className="text-emerald-400 font-bold text-sm">{product.stock} units</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(product);
                      setShowDetail(false);
                    }}
                    disabled={isOutOfStock || remainingStockInCart <= 0}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 ${
                      isOutOfStock || remainingStockInCart <= 0
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${accentColorClass}`
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ({remainingStockInCart} available)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
