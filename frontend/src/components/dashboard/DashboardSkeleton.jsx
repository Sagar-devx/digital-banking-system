import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>)}
      </div>
    </div>
  );
}
