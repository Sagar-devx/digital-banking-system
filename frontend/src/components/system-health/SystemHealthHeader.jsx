import React from 'react';
import { Clock, RefreshCw, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SystemHealthHeader({
  lastChecked,
  countdown,
  loading,
  onRunDiagnostics
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="w-4 h-4 mr-1.5" />
          Last updated: {lastChecked ? lastChecked.toLocaleTimeString() : 'Checking...'}
          <span className="mx-2">•</span>
          <span className="flex items-center text-primary-600 font-medium">
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} />
            Refreshing in {countdown}s
          </span>
        </div>
      </div>
      <button 
        onClick={onRunDiagnostics}
        disabled={loading}
        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center shadow-sm disabled:opacity-50"
      >
        <Activity className={cn("w-4 h-4 mr-2 text-primary-600", loading && "animate-spin")} />
        Run Diagnostics
      </button>
    </div>
  );
}
