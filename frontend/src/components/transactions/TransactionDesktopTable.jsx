import React from 'react';
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TransactionDesktopTable({
  loading,
  filteredTxns,
  currentAccount,
  formatCurrency,
  navigate
}) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
            <th className="p-4 pl-6">Transaction</th>
            <th className="p-4">Reference ID</th>
            <th className="p-4">Date</th>
            <th className="p-4">Status</th>
            <th className="p-4 pr-6 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="p-4 pl-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                <td className="p-4 pr-6"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
              </tr>
            ))
          ) : filteredTxns.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No transactions found</h3>
                <p className="text-xs text-gray-500">Try adjusting your filters or search term.</p>
              </td>
            </tr>
          ) : (
            filteredTxns.map((txn) => {
              const isDebit = txn.senderAccountNumber === currentAccount?.accountNumber;
              return (
                <tr 
                  key={txn.id} 
                  className="hover:bg-gray-50 transition-colors group cursor-pointer" 
                  onClick={() => navigate(`/transactions/${txn.id}`)}
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 transition-transform group-hover:scale-105",
                        isDebit ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{txn.description}</p>
                        <p className="text-xs text-gray-500">{txn.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {txn.id.split('-')[0]}...
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(txn.createdAt + (txn.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString()}<br/>
                    <span className="text-xs text-gray-400">{new Date(txn.createdAt + (txn.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full uppercase tracking-wide border",
                      txn.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200" :
                      txn.status === 'FAILED' || txn.status === 'FLAGGED' ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    )}>
                      {txn.status}
                    </span>
                  </td>
                  <td className={cn(
                    "p-4 pr-6 text-right font-semibold",
                    isDebit ? "text-gray-900" : "text-green-600"
                  )}>
                    {isDebit ? '-' : '+'}{formatCurrency(txn.amount)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
