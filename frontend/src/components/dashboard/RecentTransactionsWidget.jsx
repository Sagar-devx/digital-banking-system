import React from 'react';
import { Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function RecentTransactionsWidget({ transactions, currentAccount, error, navigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button 
          onClick={() => navigate('/transactions')}
          className="text-sm font-medium text-[--color-primary-600] hover:text-[--color-primary-700] transition-colors"
        >
          View all
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">No transactions yet</p>
            <p className="text-gray-500 text-sm">When you make a transaction, it will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => {
              const isCredit = tx.receiverAccountNumber === currentAccount?.accountNumber;
              return (
                <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isCredit ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {isCredit ? 'Received Money' : 'Sent Money'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      isCredit ? "text-green-600" : "text-gray-900"
                    )}>
                      {isCredit ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mt-1",
                      tx.status === 'COMPLETED' ? "bg-green-50 text-green-700" :
                      tx.status === 'FAILED' ? "bg-red-50 text-red-700" :
                      tx.status === 'PENDING' || tx.status === 'PROCESSING' || tx.status === 'PENDING_VERIFICATION' ? "bg-yellow-50 text-yellow-700" :
                      tx.status === 'FLAGGED' ? "bg-orange-50 text-orange-700" :
                      "bg-gray-50 text-gray-700"
                    )}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
