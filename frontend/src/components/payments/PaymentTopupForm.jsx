import React from 'react';
import { CreditCard, Zap, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import QuickAmountSelector from './QuickAmountSelector';

export default function PaymentTopupForm({
  amount,
  setAmount,
  description,
  setDescription,
  loading,
  error,
  handleCreateOrder
}) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-8">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 blur-xl opacity-50"></div>
          <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <CreditCard className="w-10 h-10 text-blue-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-1.5 rounded-full border-2 border-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Enter Amount</label>
            <div className="relative max-w-xs mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-400">₹</span>
              </div>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-4xl font-bold text-gray-900 text-center bg-gray-50/50 hover:bg-gray-50 tracking-tight"
                placeholder="0.00"
              />
            </div>
          </div>

          <QuickAmountSelector amount={amount} setAmount={setAmount} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 bg-gray-50/50 hover:bg-gray-50"
            placeholder="e.g., Monthly Savings"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-start text-sm font-medium">
            <Info className="w-5 h-5 mr-2 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full bg-[#02042b] text-white py-4 rounded-2xl font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg shadow-lg shadow-[#02042b]/20"
          >
            {loading ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <span className="flex items-center">
                Proceed to Pay
                <ExternalLink className="w-5 h-5 ml-2 text-white/70" />
              </span>
            )}
          </button>
          
          <div className="flex items-center justify-center mt-6 space-x-2 text-sm text-gray-500">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Secured by <span className="font-semibold text-gray-900">Razorpay</span></span>
          </div>
        </div>
      </form>
    </div>
  );
}
