import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function TransactionInfoCard({ txn }) {
  return (
    <div className="p-8 space-y-6 md:border-r border-gray-100">
      <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Transaction Details</h3>
      
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5">Reference Number</p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="font-mono text-sm text-gray-900 break-all">{txn.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">From Account</p>
            <p className="font-semibold text-gray-900">{txn.senderAccountNumber}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">To Account</p>
            <p className="font-semibold text-gray-900">{txn.receiverAccountNumber}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5">Date & Time</p>
          <p className="font-medium text-gray-900">
            {new Date(txn.createdAt + (txn.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })} at {new Date(txn.createdAt + (txn.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleTimeString()}
          </p>
        </div>

        {txn.failureReason && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm mt-4">
            <p className="text-sm font-bold text-red-800 mb-1.5 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5" /> Failure Reason
            </p>
            <p className="text-sm text-red-700 leading-relaxed">{txn.failureReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
