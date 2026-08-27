import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function TransferSuccessStep({ amount, receiverAccountNumber }) {
  return (
    <div className="p-12 text-center space-y-6">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner z-10">
          <CheckCircle className="w-12 h-12" />
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transfer Successful</h2>
        <p className="text-gray-500 text-lg mb-8">
          ₹{parseFloat(amount || 0).toLocaleString('en-IN')} sent successfully to {receiverAccountNumber}
        </p>
      </div>
      
      <div className="flex items-center justify-center text-sm font-medium text-primary-600">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Redirecting to receipt...
      </div>
    </div>
  );
}
