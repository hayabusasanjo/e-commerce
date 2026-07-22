export type StoreId = 'store1' | 'store2';

export type ProductCategory = 
  | 'Electronics'
  | 'Apparel'
  | 'Footwear'
  | 'Home & Living'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: ProductCategory;
  description: string;
  imageUrl: string;
  minStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedStore: StoreId;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'gcash' | 'card' | 'cod';
}

export interface Order {
  id: string;
  storeId: StoreId;
  customer: CustomerDetails;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  action: 'PURCHASE' | 'RESTOCK' | 'CREATE' | 'UPDATE' | 'DELETE';
  previousStock: number;
  newStock: number;
  change: number;
  storeOrigin?: StoreId | 'ADMIN';
  timestamp: string;
  notes?: string;
}
