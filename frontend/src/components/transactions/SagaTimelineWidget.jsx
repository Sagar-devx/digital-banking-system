import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SagaTimelineWidget({ steps }) {
  return (
    <div className="p-8 bg-gray-50/30">
      <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-6">Saga Pattern Timeline</h3>
      
      <div className="space-y-0 pl-4 relative">
        <div className="absolute left-9 top-4 bottom-4 w-0.5 bg-gray-200"></div>
        
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 relative z-10 pb-6 last:pb-0">
            {/* Status Dot/Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm",
                step.status === 'done' ? "bg-green-500 text-white" :
                step.status === 'error' ? "bg-red-500 text-white" :
                "bg-blue-500 text-white animate-pulse"
              )}>
                {step.status === 'done' && <CheckCircle2 className="w-5 h-5" />}
                {step.status === 'error' && <XCircle className="w-5 h-5" />}
                {step.status === 'current' && <Clock className="w-5 h-5" />}
              </div>
            </div>
            
            {/* Step Content */}
            <div className="flex-1 pt-1.5 pb-2">
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{step.label}</h4>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
