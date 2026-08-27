import React from 'react';
import { Server } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ServiceHealthGrid({ healthData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {healthData.length > 0 ? (
        healthData.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Status indicator line at top */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              service.status === 'UP' ? "bg-green-500" : "bg-red-500"
            )}></div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  service.status === 'UP' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{service.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">:{service.port}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {service.status === 'UP' ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                ) : (
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-end border-t border-gray-50 pt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={cn(
                  "inline-flex items-center font-bold text-sm",
                  service.status === 'UP' ? "text-green-600" : "text-red-600"
                )}>
                  {service.status}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Latency</p>
                <span className="font-mono text-sm text-gray-700 font-medium">
                  {service.latency ? `${service.latency}ms` : '--'}
                </span>
              </div>
            </div>
            
            {service.error && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {service.error}
              </div>
            )}
          </div>
        ))
      ) : (

        Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-40 animate-pulse">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-50 flex justify-between">
              <div className="space-y-2"><div className="h-3 w-10 bg-gray-100 rounded"></div><div className="h-4 w-12 bg-gray-200 rounded"></div></div>
              <div className="space-y-2 items-end flex flex-col"><div className="h-3 w-10 bg-gray-100 rounded"></div><div className="h-4 w-12 bg-gray-200 rounded"></div></div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
