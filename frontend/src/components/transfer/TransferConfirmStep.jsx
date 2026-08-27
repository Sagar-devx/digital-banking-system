import React from 'react';

export default function TransferConfirmStep({
  formData,
  currentAccount,
  onBack,
  onConfirm
}) {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Review Transfer</h2>
      
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-500 font-medium">Amount</span>
          <span className="text-2xl font-bold text-gray-900">
            ₹{parseFloat(formData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-500 font-medium">To Account</span>
          <span className="font-semibold text-gray-900">{formData.receiverAccountNumber}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-500 font-medium">From Account</span>
          <span className="font-semibold text-gray-900">•••• {currentAccount?.accountNumber?.slice(-4)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 font-medium">Note</span>
          <span className="font-medium text-gray-900">{formData.description || 'None'}</span>
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
        >
          Confirm & Send
        </button>
      </div>
    </div>
  );
}
