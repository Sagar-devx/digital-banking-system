import React from 'react';
import { Link } from 'react-router-dom';
import { X, Shield, ChevronRight } from 'lucide-react';

export default function AccessAccountModal({
  isOpen,
  onClose,
  accountNumber,
  setAccountNumber,
  handleAccess,
  loading,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Access Account</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleAccess} className="space-y-5">
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
              <input
                id="accountNumber"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{12}"
                maxLength={12}
                value={accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAccountNumber(val);
                }}
                placeholder="Enter 12-digit number"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-gray-900 font-medium tracking-wider"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" /> {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !accountNumber}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center shadow-lg shadow-gray-900/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Accessing...
                </>
              ) : (
                <>Access Dashboard <ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-4">New to DigitalBank?</p>
            <Link
              to="/accounts/create"
              onClick={onClose}
              className="w-full bg-primary-50 text-primary-700 py-3.5 rounded-xl font-semibold hover:bg-primary-100 transition flex justify-center items-center"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
