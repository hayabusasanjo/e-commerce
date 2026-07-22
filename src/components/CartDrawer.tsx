import React, { useState } from 'react';
import type { CartItem, StoreId } from '../types';
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentStore: StoreId;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (discount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentStore,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  // Filter items for current store view
  const storeCartItems = cart.filter(item => item.selectedStore === currentStore);
  const subtotal = storeCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% VAT
  const total = Math.max(0, subtotal + tax - appliedDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const code = couponCode.trim().toUpperCase();
    if (code === 'SYNC10' || code === 'ECOMM10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMsg({ text: `🎉 10% Discount Applied (-₱${discount.toLocaleString()})`, success: true });
    } else if (code === 'PROMO500') {
      setAppliedDiscount(500);
      setCouponMsg({ text: '🎉 ₱500 Off Discount Applied!', success: true });
    } else {
      setCouponMsg({ text: 'Invalid promo code. Try "SYNC10"', success: false });
    }
  };

  const storeName = currentStore === 'store1' ? 'Store Alpha (Downtown)' : 'Store Beta (Uptown)';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel bg-gray-950/95 border-l border-gray-800 shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
                <p className="text-xs text-gray-400">Purchasing at <span className="font-semibold text-emerald-400">{storeName}</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {storeCartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-300">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Add items from the product catalog to begin checkout.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-800">
                  <span>{storeCartItems.length} Product(s)</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                </div>

                {storeCartItems.map((item) => {
                  const maxStock = item.product.stock;
                  return (
                    <div
                      key={item.product.id}
                      className="glass-card p-4 rounded-2xl border border-gray-800 flex space-x-4 items-center"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-700/60"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-xs font-mono text-emerald-400">₱{item.product.price.toLocaleString()}</p>
                        
                        <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-1">
                          <span>Max live stock:</span>
                          <span className="font-bold text-gray-200">{maxStock}</span>
                        </div>
                      </div>

                      {/* Quantity Adjusters */}
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-1.5 bg-gray-900 border border-gray-700/80 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className={`p-1 rounded text-gray-400 ${
                              item.quantity >= maxStock
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:text-white hover:bg-gray-800'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Cart Footer Summary */}
          {storeCartItems.length > 0 && (
            <div className="p-6 border-t border-gray-800 bg-gray-950 space-y-4">
              
              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder='Promo code (try "SYNC10")'
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-colors"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-xs font-semibold ${couponMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-gray-400 pt-2 border-t border-gray-800/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-200 font-mono">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5% VAT)</span>
                  <span className="text-gray-200 font-mono">₱{tax.toLocaleString()}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-₱{appliedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-gray-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 font-mono">₱{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={() => onProceedToCheckout(appliedDiscount)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-gray-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-400 transition-all active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Multi-Store Inventory Deduction</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
