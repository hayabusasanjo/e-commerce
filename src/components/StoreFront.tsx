import React, { useState, useMemo } from 'react';
import type { Product, StoreId, ProductCategory, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { Search, ArrowUpDown, Store, Zap, Sparkles } from 'lucide-react';

interface StoreFrontProps {
  storeId: StoreId;
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  otherStoreName: string;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Electronics',
  'Apparel',
  'Footwear',
  'Home & Living',
  'Accessories'
];

export const StoreFront: React.FC<StoreFrontProps> = ({
  storeId,
  products,
  cart,
  onAddToCart,
  otherStoreName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');

  const isStore1 = storeId === 'store1';
  const storeTitle = isStore1 ? 'Store Alpha' : 'Store Beta';
  const storeLocation = isStore1 ? 'Downtown Hub (Store #1)' : 'Uptown District (Store #2)';

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock') return b.stock - a.stock;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find(c => c.product.id === productId && c.selectedStore === storeId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Store Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 border ${
        isStore1
          ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-gray-950 border-emerald-500/30'
          : 'bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-gray-950 border-violet-500/30'
      }`}>
        
        {/* Background glow graphics */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isStore1 ? 'bg-emerald-500' : 'bg-violet-500'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isStore1 
                  ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20' 
                  : 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
              }`}>
                {storeTitle}
              </span>
              <span className="text-gray-400 text-xs font-medium flex items-center space-x-1">
                <Store className="w-3.5 h-3.5" />
                <span>{storeLocation}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isStore1 ? 'Downtown Flagship Outlet' : 'Uptown Tech & Lifestyle Outlet'}
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl">
              Browse our synchronized catalog. Any item purchased in <span className="font-semibold text-white">{storeTitle}</span> will <span className="underline decoration-emerald-400 font-bold">automatically deduct stock</span> from <span className="font-semibold text-white">{otherStoreName}</span> in real time!
            </p>
          </div>

          {/* Sync info highlight card */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex items-center space-x-4 max-w-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isStore1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
            }`}>
              <Zap className="w-6 h-6 sync-dot" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-gray-100 flex items-center space-x-1">
                <span>Real-Time Sync Active</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-gray-400 mt-0.5">Shared global inventory across both Store 1 & Store 2.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product, SKU, specs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? isStore1
                    ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-violet-500 text-white font-bold shadow-md shadow-violet-500/20'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 text-gray-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock Available</option>
          </select>
        </div>

      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-gray-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-200">No products found</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            We couldn't find any products matching "{searchTerm}". Try clearing search filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeId={storeId}
              onAddToCart={onAddToCart}
              cartItemQuantity={getCartQuantity(product.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
