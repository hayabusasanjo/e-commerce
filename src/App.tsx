import { useState, useEffect } from 'react';
import type { StoreId, Product, Order, InventoryLog, CartItem } from './types';
import { storeSync } from './services/storeSync';
import { Navbar } from './components/Navbar';
import { StoreFront } from './components/StoreFront';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SplitDemoView } from './components/SplitDemoView';
import { Zap, CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<StoreId | 'admin' | 'split'>('store1');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state and subscribe to real-time sync updates
  useEffect(() => {
    const refreshData = () => {
      setProducts(storeSync.getProducts());
      setOrders(storeSync.getOrders());
      setLogs(storeSync.getInventoryLogs());
    };

    refreshData();
    const unsubscribe = storeSync.subscribe(() => {
      refreshData();
    });

    return () => unsubscribe();
  }, []);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add product to cart handler
  const handleAddToCart = (product: Product, targetStore: StoreId = (currentView === 'store2' ? 'store2' : 'store1')) => {
    const existingIndex = cart.findIndex(c => c.product.id === product.id && c.selectedStore === targetStore);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart >= product.stock) {
      showToast(`Cannot add more "${product.name}". Max available stock reached!`);
      return;
    }

    const updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({
        product,
        quantity: 1,
        selectedStore: targetStore
      });
    }

    setCart(updatedCart);
    showToast(`Added "${product.name}" to cart!`);
  };

  // Cart quantity update
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const activeStore: StoreId = currentView === 'store2' ? 'store2' : 'store1';
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const updated = cart.map(item => {
      if (item.product.id === productId && item.selectedStore === activeStore) {
        const liveProduct = products.find(p => p.id === productId);
        const maxStock = liveProduct ? liveProduct.stock : item.product.stock;
        return { ...item, quantity: Math.min(quantity, maxStock) };
      }
      return item;
    });

    setCart(updated);
  };

  // Remove single item from cart
  const handleRemoveCartItem = (productId: string) => {
    const activeStore: StoreId = currentView === 'store2' ? 'store2' : 'store1';
    setCart(cart.filter(item => !(item.product.id === productId && item.selectedStore === activeStore)));
  };

  // Clear cart
  const handleClearCart = () => {
    const activeStore: StoreId = currentView === 'store2' ? 'store2' : 'store1';
    setCart(cart.filter(item => item.selectedStore !== activeStore));
  };

  // Launch Checkout Modal
  const handleProceedToCheckout = (discount: number) => {
    setAppliedDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // On order successfully processed
  const handleOrderSuccess = () => {
    const activeStore: StoreId = currentView === 'store2' ? 'store2' : 'store1';
    setCart(cart.filter(item => item.selectedStore !== activeStore));
    showToast('🎉 Purchase complete! Stock deducted in real time across stores.');
  };

  // Reset inventory data
  const handleResetData = () => {
    if (window.confirm('Reset catalog and stock counts back to default sample state?')) {
      storeSync.resetData();
      setCart([]);
      showToast('Inventory reset to initial default state.');
    }
  };

  // Active store calculation for Cart
  const activeStoreForCart: StoreId = currentView === 'store2' ? 'store2' : 'store1';
  const activeCartItems = cart.filter(item => item.selectedStore === activeStoreForCart);
  const cartCount = activeCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = activeCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-gray-950">
      
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main View Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {currentView === 'store1' && (
          <StoreFront
            storeId="store1"
            products={products}
            cart={cart}
            onAddToCart={(p) => handleAddToCart(p, 'store1')}
            otherStoreName="Store Beta (Uptown)"
          />
        )}

        {currentView === 'store2' && (
          <StoreFront
            storeId="store2"
            products={products}
            cart={cart}
            onAddToCart={(p) => handleAddToCart(p, 'store2')}
            otherStoreName="Store Alpha (Downtown)"
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            logs={logs}
          />
        )}

        {currentView === 'split' && (
          <SplitDemoView
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950 py-8 text-center text-xs text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-gray-200">OmniSync Commerce Hub</span>
            <span>— Dual Store Real-time Inventory System</span>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            <span>Powered by BroadcastChannel & LocalStorage API</span>
            <span>•</span>
            <button onClick={handleResetData} className="hover:text-emerald-400 underline">
              Reset Sample Stock Data
            </button>
          </div>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentStore={activeStoreForCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        storeId={activeStoreForCart}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="glass-panel px-4 py-3 rounded-2xl border border-emerald-500/50 bg-gray-950/95 shadow-2xl text-xs font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
export default App;
