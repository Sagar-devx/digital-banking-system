import React from 'react';
import { CheckCircle2, Copy, AlertCircle } from 'lucide-react';

export default function AccountSuccessCard({
  createdAccount,
  copied,
  copyToClipboard,
  onGoToDashboard
}) {
  return (
    <div className="text-center animate-in zoom-in duration-500 py-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
      <p className="text-gray-500 mb-8">
        Your new {createdAccount.accountType?.replace('_', ' ').toLowerCase()} account is ready to use.
      </p>
      
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[--color-primary-400] to-[--color-primary-600]"></div>
        <p className="text-sm font-medium text-gray-500 mb-2">Your Account Number</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-3xl font-mono font-bold tracking-widest text-gray-900">
            {createdAccount.accountNumber}
          </p>
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
        <p className="text-xs text-red-500 mt-4 font-medium flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Please save this number securely
        </p>
      </div>

      <button
        type="button"
        onClick={onGoToDashboard}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
