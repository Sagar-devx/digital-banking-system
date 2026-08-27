import React from 'react';
import { Search } from 'lucide-react';

export default function TransactionHeader({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  totalCount
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500">View all your incoming and outgoing transactions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64 shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-10 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="FAILED">Failed</option>
            <option value="FLAGGED">Flagged</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Total Transactions</span>
        <span className="bg-primary-100 text-primary-700 py-0.5 px-2.5 rounded-full text-xs font-bold">
          {totalCount}
        </span>
      </div>
    </div>
  );
}
