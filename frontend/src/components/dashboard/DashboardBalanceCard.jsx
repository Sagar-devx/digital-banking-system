import React from 'react';

export default function DashboardBalanceCard({ currentAccount }) {
  return (
    <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-900/10">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-green-500/20 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <p className="text-gray-400 font-medium mb-1">Total Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            ₹{parseFloat(currentAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="mt-12 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Account Number</p>
            <p className="font-mono text-lg tracking-wider">
              •••• {currentAccount.accountNumber?.slice(-4)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <p className="text-sm font-medium text-green-100 capitalize">{currentAccount.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
