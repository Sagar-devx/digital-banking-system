import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TransactionDetailBanner({
  txn,
  isFailed,
  isCompleted,
  isPending,
  formatCurrency
}) {
  return (
    <div className={cn(
      "px-8 py-10 text-center border-b border-gray-100 transition-colors duration-300",
      isFailed ? "bg-red-50/70" : isCompleted ? "bg-green-50/70" : "bg-yellow-50/70"
    )}>
      <div className="flex justify-center mb-5">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm border-4",
          isFailed ? "border-red-100 text-red-500" : isCompleted ? "border-green-100 text-green-500" : "border-yellow-100 text-yellow-500"
        )}>
          {isCompleted && <CheckCircle2 className="w-8 h-8" />}
          {isFailed && <XCircle className="w-8 h-8" />}
          {isPending && <Clock className="w-8 h-8" />}
        </div>
      </div>
      <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{formatCurrency(txn.amount)}</h2>
      <p className="text-lg font-medium text-gray-700">{txn.description}</p>
      <div className="mt-5 flex justify-center">
        <span className={cn(
          "px-3.5 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm",
          isCompleted ? "bg-green-100 text-green-800 border border-green-200" :
          isFailed ? "bg-red-100 text-red-800 border border-red-200" :
          "bg-yellow-100 text-yellow-800 border border-yellow-200"
        )}>
          {txn.status}
        </span>
      </div>
    </div>
  );
}
