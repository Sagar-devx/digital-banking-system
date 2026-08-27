import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TransactionMobileList({
  loading,
  filteredTxns,
  currentAccount,
  formatCurrency
}) {
  return (
    <div className="block sm:hidden divide-y divide-gray-100">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))
      ) : filteredTxns.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No transactions found</h3>
          <p className="text-xs text-gray-500">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        filteredTxns.map((txn) => {
          const isDebit = txn.senderAccountNumber === currentAccount?.accountNumber;
          return (
            <Link key={txn.id} to={`/transactions/${txn.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isDebit ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  )}>
                    {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{txn.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(txn.createdAt).toLocaleDateString()} • {new Date(txn.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "text-right font-semibold text-sm",
                  isDebit ? "text-gray-900" : "text-green-600"
                )}>
                  {isDebit ? '-' : '+'}{formatCurrency(txn.amount)}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-mono text-gray-400">{txn.id.split('-')[0]}...</span>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-medium rounded-full uppercase",
                  txn.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                  txn.status === 'FAILED' || txn.status === 'FLAGGED' ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                )}>
                  {txn.status}
                </span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
