import React, { useState } from 'react';
import type { Product, Order, InventoryLog, ProductCategory } from '../types';
import { storeSync } from '../services/storeSync';
import { 
  Package, Plus, Edit2, Trash2, DollarSign, ShoppingBag, 
  Activity, AlertTriangle, Search, 
  Layers, ArrowUpRight, Zap
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  logs: InventoryLog[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'logs' | 'orders'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: ProductCategory;
    description: string;
    imageUrl: string;
    minStockThreshold: number;
  }>({
    name: '',
    sku: '',
    price: 0,
    stock: 10,
    category: 'Electronics',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    minStockThreshold: 5,
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Handle Add Product Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeSync.createProduct(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  // Handle Edit Product Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    storeSync.updateProduct(editingProduct.id, formData);
    setEditingProduct(null);
    resetForm();
  };

  // Handle Quick Stock Adjustments
  const handleQuickStockChange = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    storeSync.updateStock(
      product.id,
      newStock,
      delta > 0 ? 'RESTOCK' : 'UPDATE',
      'ADMIN',
      `Manual quick ${delta > 0 ? 'restock' : 'deduction'} in Admin Dashboard`
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: 0,
      stock: 10,
      category: 'Electronics',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      minStockThreshold: 5,
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      minStockThreshold: product.minStockThreshold,
    });
  };

  const fillSamplePreset = () => {
    const presets = [
      { name: '4K Ultra HD Gaming Monitor 27"', sku: 'DISP-4K-09', price: 18900, stock: 12, category: 'Electronics' as ProductCategory, description: '144Hz IPS gaming monitor with 1ms response time and HDR400.', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
      { name: 'Ergonomic Breathable Mesh Desk Chair', sku: 'FURN-CHAIR-10', price: 8500, stock: 15, category: 'Home & Living' as ProductCategory, description: 'High back office chair with adjustable lumbar support and headrest.', imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80' },
      { name: 'Ankle High Trail Running Shoes', sku: 'FOOT-TRAIL-11', price: 4200, stock: 20, category: 'Footwear' as ProductCategory, description: 'Durable trail running shoes with Vibram high-traction rubber outsoles.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' }
    ];
    const picked = presets[Math.floor(Math.random() * presets.length)];
    setFormData({
      ...picked,
      minStockThreshold: 4
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Title Header */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 sync-dot text-blue-400" />
            <span>Master Control & Synchronization Hub</span>
          </div>
          <h1 className="text-3xl font-black text-white">Central Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage global inventory, add/edit/delete products, monitor real-time stock deductions, and audit order logs across both stores.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">₱{totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>From {orders.length} Completed Orders</span>
          </div>
        </div>

        {/* Total Products & Stock */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Catalog & Total Units</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{products.length} Items <span className="text-sm font-normal text-gray-400">({totalStockCount} units)</span></div>
          <div className="text-[11px] text-gray-400">Synchronized across Store 1 & 2</div>
        </div>

        {/* Low Stock Warning */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{lowStockCount} Products</div>
          <div className="text-[11px] text-amber-300 font-medium">Near min stock threshold</div>
        </div>

        {/* Out of stock */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Out of Stock Items</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">{outOfStockCount} Products</div>
          <div className="text-[11px] text-red-300 font-medium">Disabled in storefronts</div>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="glass-panel p-2 rounded-2xl border border-gray-800 flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory (CRUD) ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Sync Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sales & Transactions ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT INVENTORY MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Search and Category Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-medium">Category Filter:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Product Data Table */}
          <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/90 uppercase text-[11px] font-bold text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">SKU & Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Live Shared Stock</th>
                    <th className="py-3.5 px-4">Quick Adjust Stock</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No products match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.stock <= p.minStockThreshold && p.stock > 0;
                      const isOut = p.stock === 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-900/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-11 h-11 rounded-xl object-cover bg-gray-900 border border-gray-700/60"
                              />
                              <div>
                                <div className="font-bold text-white text-sm">{p.name}</div>
                                <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">{p.description}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-emerald-400 font-semibold">{p.sku}</div>
                            <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-medium">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                            ₱{p.price.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`font-mono font-extrabold text-sm ${
                                isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {p.stock} units
                              </span>

                              {isOut ? (
                                <span className="bg-red-950 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-800/50 font-bold">
                                  OUT OF STOCK
                                </span>
                              ) : isLow ? (
                                <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-800/50 font-bold">
                                  LOW STOCK
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* Quick Adjust Stock */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleQuickStockChange(p, -1)}
                                className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white"
                                title="Deduct 1 unit"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleQuickStockChange(p, +5)}
                                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold"
                                title="Restock +5 units"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickStockChange(p, +20)}
                                className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-bold"
                                title="Restock +20 units"
                              >
                                +20
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME INVENTORY LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">Live Inventory Audit Log</h3>
              <p className="text-xs text-gray-400">Tracks every purchase, restock, edit, and deletion event in real time.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              {logs.length} Log Entries Recorded
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No inventory log entries yet.</p>
            ) : (
              logs.map((log) => {
                const isPurchase = log.action === 'PURCHASE';
                const isRestock = log.action === 'RESTOCK' || log.action === 'CREATE';

                return (
                  <div
                    key={log.id}
                    className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${
                        isPurchase
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isRestock
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {isPurchase ? <ShoppingBag className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="font-bold text-white text-sm">
                          {log.productName}
                          <span className={`ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                            log.storeOrigin === 'store1'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.storeOrigin === 'store2'
                              ? 'bg-violet-950 text-violet-300 border border-violet-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            Origin: {log.storeOrigin === 'store1' ? 'Store Alpha' : log.storeOrigin === 'store2' ? 'Store Beta' : 'Admin Hub'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{log.notes}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="font-mono font-bold text-sm">
                        <span className="text-gray-500">{log.previousStock}</span>
                        <span className="text-gray-400 mx-1">➔</span>
                        <span className="text-white">{log.newStock} units</span>
                        <span className={`ml-2 text-xs font-bold ${log.change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          ({log.change > 0 ? `+${log.change}` : log.change})
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & TRANSACTIONS */}
      {activeTab === 'orders' && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="border-b border-gray-800 pb-4">
            <h3 className="text-lg font-extrabold text-white">Sales & Customer Orders</h3>
            <p className="text-xs text-gray-400">Consolidated history of transactions processed at Store 1 and Store 2.</p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No orders recorded yet. Make a purchase in Store 1 or Store 2 to view transaction logs!</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-3 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{ord.id}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        ord.storeId === 'store1'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-violet-950 text-violet-300 border border-violet-800'
                      }`}>
                        {ord.storeId === 'store1' ? 'Store Alpha (Downtown)' : 'Store Beta (Uptown)'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(ord.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block font-bold mb-1">Customer Info</span>
                      <p className="text-white font-semibold">{ord.customer.fullName} ({ord.customer.phone})</p>
                      <p className="text-gray-400">{ord.customer.email}</p>
                      <p className="text-gray-400">{ord.customer.address}, {ord.customer.city}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-bold mb-1">Order Items</span>
                      <ul className="space-y-1">
                        {ord.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-gray-300">
                            <span>• {item.productName} (x{item.quantity})</span>
                            <span className="font-mono text-white">₱{item.subtotal.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between font-bold text-sm text-white">
                        <span>Total Paid ({ord.customer.paymentMethod.toUpperCase()})</span>
                        <span className="text-emerald-400 font-mono">₱{ord.finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden border border-gray-800 shadow-2xl p-6 relative bg-gray-950">
            <button
              onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Synchronized Product'}
              </h2>
              {!editingProduct && (
                <button
                  type="button"
                  onClick={fillSamplePreset}
                  className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-xl font-semibold hover:bg-indigo-900"
                >
                  ⚡ Auto-fill Demo Specs
                </button>
              )}
            </div>

            <form onSubmit={editingProduct ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ergonomic Office Desk"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. FURN-DESK-01"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (₱)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Shared Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product specs and features..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-gray-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Product?</h3>
            <p className="text-xs text-gray-400">
              Are you sure you want to remove this item from the catalog? This will delete it across Store 1 and Store 2.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  storeSync.deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
