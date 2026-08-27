import React from 'react';
import { cn } from '../../utils/cn';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

export default function QuickAmountSelector({ amount, setAmount }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {QUICK_AMOUNTS.map(amt => (
        <button
          key={amt}
          type="button"
          onClick={() => setAmount(amt.toString())}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-semibold transition-all border",
            amount === amt.toString() 
              ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          +₹{amt.toLocaleString('en-IN')}
        </button>
      ))}
    </div>
  );
}
