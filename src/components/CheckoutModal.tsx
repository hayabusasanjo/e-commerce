import React, { useState } from 'react';
import type { CartItem, StoreId, CustomerDetails, Order } from '../types';
import { storeSync } from '../services/storeSync';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, CreditCard, Wallet, Truck, Printer, X, Zap } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  storeId: StoreId;
  appliedDiscount: number;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  storeId,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    phone: '0917 123 4567',
    address: '123 Rizal St, Brgy. Central',
    city: 'Metro Manila',
    paymentMethod: 'gcash'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const storeCartItems = cart.filter(item => item.selectedStore === storeId);
  const subtotal = storeCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal + tax - appliedDiscount);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = storeSync.processCheckout(storeCartItems, customer, storeId, appliedDiscount);
      setIsProcessing(false);

      if (result.success && result.order) {
        setCompletedOrder(result.order);
        onOrderSuccess();

        // Launch celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMsg(result.error || 'Checkout failed due to insufficient stock.');
      }
    }, 800);
  };

  const isStore1 = storeId === 'store1';
  const storeBadgeTitle = isStore1 ? 'Store Alpha (Downtown Outlet)' : 'Store Beta (Uptown Hub)';
  const otherStoreTitle = isStore1 ? 'Store Beta (Uptown)' : 'Store Alpha (Downtown)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden border border-gray-800 shadow-2xl my-8 relative bg-gray-950">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${isStore1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {completedOrder ? 'Order Receipt & Sync Summary' : 'Complete Checkout'}
              </h2>
              <p className="text-xs text-gray-400">
                Purchasing via <span className="font-bold text-gray-200">{storeBadgeTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedOrder ? (
          /* Receipt Screen */
          <div className="p-6 space-y-6">
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-2xl font-black text-white">Purchase Successful!</h3>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                Stock has been <span className="font-bold underline">deducted in real-time</span> across both <span className="font-bold">{storeBadgeTitle}</span> and <span className="font-bold">{otherStoreTitle}</span>!
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-xs">
                <span className="text-gray-400">Order ID: <span className="font-mono text-white font-bold">{completedOrder.id}</span></span>
                <span className="text-gray-400">{new Date(completedOrder.timestamp).toLocaleString()}</span>
              </div>

              {/* Items Purchased */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Items Purchased</h4>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1">
                    <span className="text-gray-200">{item.productName} <span className="text-gray-400 font-mono">x{item.quantity}</span></span>
                    <span className="text-white font-mono font-semibold">₱{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-800 pt-3 space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-200">₱{completedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5% VAT)</span>
                  <span className="font-mono text-gray-200">₱{completedOrder.taxAmount.toLocaleString()}</span>
                </div>
                {completedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-₱{completedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-gray-800">
                  <span>Total Paid</span>
                  <span className="text-emerald-400 font-mono text-base">₱{completedOrder.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="border-t border-gray-800 pt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">Customer Name</span>
                  <span className="text-gray-200">{completedOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">Payment Method</span>
                  <span className="text-emerald-400 uppercase font-bold">{completedOrder.customer.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-extrabold text-xs flex items-center justify-center space-x-2"
              >
                <span>Done & Return to Store</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Live Synchronized inventory notice */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-3 text-xs text-emerald-300">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 sync-dot" />
              <span>
                Completing this transaction will immediately trigger an atomic stock reduction broadcasted to all connected stores.
              </span>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Customer & Shipping Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Select Payment Method</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'gcash' })}
                  className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all ${
                    customer.paymentMethod === 'gcash'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-bold">GCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'card' })}
                  className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all ${
                    customer.paymentMethod === 'card'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'cod' })}
                  className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all ${
                    customer.paymentMethod === 'cod'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Order Total & Submit Button */}
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Total Payment Amount</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₱{total.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Processing & Deducting Stock...' : 'Confirm Order & Deduct Stock'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
