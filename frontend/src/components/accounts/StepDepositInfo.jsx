import React from 'react';
import { Building2, Wallet, Loader2 } from 'lucide-react';

export default function StepDepositInfo({
  formData,
  handleChange,
  onBack,
  loading
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">Account Type</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="accountType"
            id="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors bg-white"
          >
            <option value="SAVINGS">Savings Account</option>
            <option value="CURRENT">Current Account</option>
            <option value="FIXED_DEPOSIT">Fixed Deposit</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="initialDeposit" className="block text-sm font-medium text-gray-700">Initial Deposit (₹)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Wallet className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            name="initialDeposit"
            id="initialDeposit"
            step="0.01"
            min="0"
            value={formData.initialDeposit}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            placeholder="100.00"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating...</>
          ) : (
            'Submit & Create Account'
          )}
        </button>
      </div>
    </div>
  );
}
