import React from 'react';
import { ArrowRight, Info, Loader2 } from 'lucide-react';

export default function TransferInputForm({
  currentAccount,
  formData,
  handleChange,
  handleReview,
  error,
  reviewLoading
}) {
  return (
    <form onSubmit={handleReview} className="p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">From Account</label>
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentAccount?.accountHolderName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{currentAccount?.accountHolderName}</p>
              <p className="text-sm text-gray-500">•••• {currentAccount?.accountNumber?.slice(-4)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Available</p>
            <p className="font-bold text-gray-900">₹{parseFloat(currentAccount?.balance || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Send To</label>
          <div className="relative">
            <input
              type="text"
              name="receiverAccountNumber"
              required
              inputMode="numeric"
              maxLength={12}
              value={formData.receiverAccountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                handleChange({ target: { name: 'receiverAccountNumber', value: val } });
              }}
              className="w-full pl-4 pr-10 py-4 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 font-medium bg-gray-50/50 hover:bg-gray-50"
              placeholder="Recipient's 12-digit Account No."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-2xl font-semibold text-gray-400">₹</span>
            </div>
            <input
              type="number"
              name="amount"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-2xl font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-50"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 bg-gray-50/50 hover:bg-gray-50"
            placeholder="What is this for?"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-start text-sm font-medium">
          <Info className="w-5 h-5 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={reviewLoading || currentAccount?.status !== 'ACTIVE'}
        className="w-full bg-dark-900 text-white py-4 rounded-2xl font-semibold hover:bg-dark-800 transition-all flex justify-center items-center text-lg mt-6 shadow-lg shadow-gray-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {reviewLoading ? (
          <>Verifying Account <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
        ) : (
          <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>
        )}
      </button>
    </form>
  );
}
