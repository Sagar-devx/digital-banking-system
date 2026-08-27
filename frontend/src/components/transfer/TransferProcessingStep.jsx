import React from 'react';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TransferProcessingStep({ processStep }) {
  return (
    <div className="p-12 text-center space-y-8">
      <div className="relative w-24 h-24 mx-auto">
        <Loader2 className="w-24 h-24 text-primary-500 animate-spin opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary-600" />
        </div>
      </div>
      
      <div className="space-y-6 max-w-xs mx-auto">
        <h3 className="text-xl font-bold text-gray-900">Processing Transfer</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", processStep >= 0 ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400")}>
              {processStep > 0 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>
            <span className={cn("font-medium", processStep >= 0 ? "text-gray-900" : "text-gray-400")}>Initiating request</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", processStep >= 1 ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400")}>
              {processStep > 1 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>
            <span className={cn("font-medium", processStep >= 1 ? "text-gray-900" : "text-gray-400")}>Security & Fraud check</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", processStep >= 2 ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400")}>
              {processStep > 2 ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>
            <span className={cn("font-medium", processStep >= 2 ? "text-gray-900" : "text-gray-400")}>Completing transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
