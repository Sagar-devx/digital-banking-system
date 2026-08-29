import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function AccountDetailsCard({ currentAccount }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Account Details</h3>
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="font-medium text-gray-900 capitalize">{currentAccount.accountType?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
              currentAccount.status === 'ACTIVE' ? "bg-green-100 text-green-800" :
              currentAccount.status === 'BLOCKED' ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            )}>
              {currentAccount.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Daily Limit</p>
            <p className="font-medium text-gray-900">
              ₹{parseFloat(currentAccount.dailyTransactionLimit || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
