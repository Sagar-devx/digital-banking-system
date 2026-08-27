import React from 'react';
import { Radio, Database } from 'lucide-react';

export default function ServiceTopologyDiagram() {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Radio className="w-5 h-5 mr-2 text-primary-500" />
          Service Topology
        </h3>
      </div>
      
      <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col items-center">
        {/* API Gateway Box */}
        <div className="bg-dark-900 text-white px-6 py-3 rounded-xl font-bold shadow-md relative z-10 w-48 text-center border-2 border-primary-500">
          API Gateway (:8080)
        </div>
        
        <div className="h-8 w-px bg-gray-300 relative z-0"></div>
        <div className="w-[80%] h-px bg-gray-300 relative z-0"></div>
        
        <div className="flex justify-between w-[80%] relative z-0">
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="h-8 w-px bg-gray-300"></div>
        </div>
        
        <div className="flex justify-between w-full mt-2 relative z-10 gap-2">
          <div className="flex-1 bg-white border border-gray-200 text-gray-700 p-3 rounded-lg text-xs font-semibold text-center shadow-sm">Account</div>
          <div className="flex-1 bg-white border border-gray-200 text-gray-700 p-3 rounded-lg text-xs font-semibold text-center shadow-sm">Transaction</div>
          <div className="flex-1 bg-white border border-gray-200 text-gray-700 p-3 rounded-lg text-xs font-semibold text-center shadow-sm">Payment</div>
          <div className="flex-1 bg-white border border-gray-200 text-gray-700 p-3 rounded-lg text-xs font-semibold text-center shadow-sm">Fraud</div>
          <div className="flex-1 bg-white border border-gray-200 text-gray-700 p-3 rounded-lg text-xs font-semibold text-center shadow-sm">Notify</div>
        </div>
        
        <div className="w-[60%] flex justify-between mt-8 relative z-0">
          <div className="h-8 w-px border-l-2 border-dashed border-primary-300"></div>
          <div className="h-8 w-px border-l-2 border-dashed border-primary-300"></div>
        </div>
        
        <div className="flex gap-4 w-[60%] mt-2 relative z-10">
          <div className="flex-1 bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs font-bold text-center flex items-center justify-center">
            <Database className="w-3 h-3 mr-1" /> Redis
          </div>
          <div className="flex-1 bg-orange-50 border border-orange-100 text-orange-700 p-3 rounded-lg text-xs font-bold text-center flex items-center justify-center">
            <Radio className="w-3 h-3 mr-1" /> Kafka
          </div>
        </div>
      </div>
    </div>
  );
}
