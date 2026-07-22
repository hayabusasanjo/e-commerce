import type { Product, Order, InventoryLog, StoreId, CartItem, CustomerDetails } from '../types';

const PRODUCTS_KEY = 'ecomm_sync_products_v1';
const ORDERS_KEY = 'ecomm_sync_orders_v1';
const LOGS_KEY = 'ecomm_sync_logs_v1';
const CHANNEL_NAME = 'ecomm_realtime_inventory_channel';

// Default initial products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Noise-Canceling Headphones',
    sku: 'AUDIO-ANC-01',
    price: 4999,
    stock: 25,
    category: 'Electronics',
    description: 'Premium active noise-canceling headphones with 30-hour battery life and spatial audio capability.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    minStockThreshold: 5,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Ultra-Fast Ergonomic Wireless Mouse',
    sku: 'PERIPH-MOUSE-02',
    price: 1850,
    stock: 18,
    category: 'Electronics',
    description: 'Precision optical gaming & productivity mouse with custom DPI settings and silent clicks.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    minStockThreshold: 4,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Minimalist Urban Canvas Backpack',
    sku: 'BAG-URBAN-03',
    price: 2499,
    stock: 12,
    category: 'Accessories',
    description: 'Water-resistant laptop backpack with padded compartment and anti-theft hidden pockets.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    minStockThreshold: 3,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Retro Classic Leather Sneakers',
    sku: 'FOOT-RETRO-04',
    price: 3890,
    stock: 8,
    category: 'Footwear',
    description: 'Handcrafted genuine leather sneakers featuring responsive memory foam insoles for max comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    minStockThreshold: 3,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Smart OLED Health Fitness Tracker',
    sku: 'WEAR-SMART-05',
    price: 3200,
    stock: 30,
    category: 'Electronics',
    description: 'Continuous heart-rate monitor, sleep tracking, SPO2 sensor, and 14-day ultra long battery.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    minStockThreshold: 8,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Organic Cotton Everyday Oversized Hoodie',
    sku: 'APP-HOOD-06',
    price: 1950,
    stock: 15,
    category: 'Apparel',
    description: 'Ultra-soft fleece lined 100% organic cotton hoodie with modern oversized silhouette.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    minStockThreshold: 4,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Stainless Steel Insulated Hydro Tumbler (1L)',
    sku: 'HOME-TUMB-07',
    price: 1290,
    stock: 40,
    category: 'Home & Living',
    description: 'Double-wall vacuum insulated tumbler that keeps beverages ice-cold for 24h or hot for 12h.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    minStockThreshold: 10,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Mechanical RGB Mechanical Keyboard',
    sku: 'PERIPH-KEYB-08',
    price: 4450,
    stock: 6,
    category: 'Electronics',
    description: 'Customizable mechanical keyboard with hotswappable switches, PBT keycaps, and per-key RGB.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    minStockThreshold: 2,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

type SyncListener = () => void;

class StoreSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    this.initStorage();
    this.initBroadcastChannel();
  }

  private initStorage() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOGS_KEY)) {
      const initialLogs: InventoryLog[] = INITIAL_PRODUCTS.map(p => ({
        id: `log-init-${p.id}`,
        productId: p.id,
        productName: p.name,
        action: 'CREATE',
        previousStock: 0,
        newStock: p.stock,
        change: p.stock,
        storeOrigin: 'ADMIN',
        timestamp: new Date().toISOString(),
        notes: 'Initial inventory seed load'
      }));
      localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_EVENT') {
          this.notifyListeners();
        }
      };
    }

    // Fallback for storage events (e.g. cross-tab)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === PRODUCTS_KEY || e.key === ORDERS_KEY || e.key === LOGS_KEY) {
          this.notifyListeners();
        }
      });
    }
  }

  private notify() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC_EVENT', timestamp: Date.now() });
    }
    this.notifyListeners();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  // --- GETTERS ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Error loading products from storage', e);
      return INITIAL_PRODUCTS;
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getInventoryLogs(): InventoryLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- INVENTORY / PRODUCTS MODIFICATIONS ---
  public addInventoryLog(log: Omit<InventoryLog, 'id' | 'timestamp'>) {
    const logs = this.getInventoryLogs();
    const newLog: InventoryLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 200))); // Keep last 200 logs
  }

  public updateStock(productId: string, newStock: number, action: InventoryLog['action'], storeOrigin: StoreId | 'ADMIN' = 'ADMIN', notes?: string): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return false;

    const target = products[index];
    const prevStock = target.stock;
    const stockChange = newStock - prevStock;

    target.stock = Math.max(0, newStock);
    target.updatedAt = new Date().toISOString();
    products[index] = target;

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    this.addInventoryLog({
      productId: target.id,
      productName: target.name,
      action,
      previousStock: prevStock,
      newStock: target.stock,
      change: stockChange,
      storeOrigin,
      notes: notes || `Stock updated to ${target.stock}`
    });

    this.notify();
    return true;
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    this.addInventoryLog({
      productId: newProduct.id,
      productName: newProduct.name,
      action: 'CREATE',
      previousStock: 0,
      newStock: newProduct.stock,
      change: newProduct.stock,
      storeOrigin: 'ADMIN',
      notes: 'New product added by Admin'
    });

    this.notify();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;

    const existing = products[index];
    const stockChanged = updates.stock !== undefined && updates.stock !== existing.stock;
    const prevStock = existing.stock;

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    if (stockChanged && updates.stock !== undefined) {
      this.addInventoryLog({
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        action: 'UPDATE',
        previousStock: prevStock,
        newStock: updates.stock,
        change: updates.stock - prevStock,
        storeOrigin: 'ADMIN',
        notes: 'Product details & stock edited'
      });
    }

    this.notify();
    return true;
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const target = products.find(p => p.id === id);
    if (!target) return false;

    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));

    this.addInventoryLog({
      productId: target.id,
      productName: target.name,
      action: 'DELETE',
      previousStock: target.stock,
      newStock: 0,
      change: -target.stock,
      storeOrigin: 'ADMIN',
      notes: 'Product removed from catalog'
    });

    this.notify();
    return true;
  }

  // --- CHECKOUT & ATOMIC STOCK DEDUCTION ---
  public processCheckout(
    cartItems: CartItem[],
    customer: CustomerDetails,
    storeId: StoreId,
    discountAmount: number = 0
  ): { success: boolean; order?: Order; error?: string } {
    const products = this.getProducts();

    // 1. Validate stock availability for all items in cart
    for (const item of cartItems) {
      const currentProd = products.find(p => p.id === item.product.id);
      if (!currentProd) {
        return { success: false, error: `Product "${item.product.name}" is no longer available.` };
      }
      if (currentProd.stock < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${currentProd.name}". Available: ${currentProd.stock}, Requested: ${item.quantity}.` 
        };
      }
    }

    // 2. Perform atomic stock deduction across products
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const index = products.findIndex(p => p.id === item.product.id);
      const prod = products[index];
      const prevStock = prod.stock;
      const newStock = prevStock - item.quantity;
      
      prod.stock = newStock;
      prod.updatedAt = new Date().toISOString();
      products[index] = prod;

      const itemSubtotal = prod.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        price: prod.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });

      // Log synchronized stock deduction
      this.addInventoryLog({
        productId: prod.id,
        productName: prod.name,
        action: 'PURCHASE',
        previousStock: prevStock,
        newStock,
        change: -item.quantity,
        storeOrigin: storeId,
        notes: `Purchased at ${storeId === 'store1' ? 'Store Alpha (Downtown)' : 'Store Beta (Uptown)'}`
      });
    }

    // 3. Save updated inventory
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    // 4. Create and save Order
    const taxAmount = Math.round(subtotal * 0.05); // 5% simulated tax
    const finalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      storeId,
      customer,
      items: orderItems,
      totalAmount: subtotal,
      discountAmount,
      taxAmount,
      finalAmount,
      timestamp: new Date().toISOString(),
      status: 'Completed'
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // 5. Notify all open windows & components
    this.notify();

    return { success: true, order: newOrder };
  }

  // --- RESET DEMO DATA ---
  public resetData() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    const initialLogs: InventoryLog[] = INITIAL_PRODUCTS.map(p => ({
      id: `log-reset-${p.id}`,
      productId: p.id,
      productName: p.name,
      action: 'RESTOCK',
      previousStock: 0,
      newStock: p.stock,
      change: p.stock,
      storeOrigin: 'ADMIN',
      timestamp: new Date().toISOString(),
      notes: 'System reset to default state'
    }));
    localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
    this.notify();
  }
}

export const storeSync = new StoreSyncService();
