import React from 'react';
import { cn } from '../../utils/cn';

export default function AccountFormStepper({ step }) {
  if (step >= 3) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-medium", step >= 1 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500")}>
            1
          </div>
          <span className="text-xs mt-1 font-medium text-gray-500">Personal</span>
        </div>
        <div className={cn("flex-1 h-0.5 mx-4", step >= 2 ? "bg-green-600" : "bg-gray-200")}></div>
        <div className="flex flex-col items-center">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-medium", step >= 2 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500")}>
            2
          </div>
          <span className="text-xs mt-1 font-medium text-gray-500">Account</span>
        </div>
      </div>
    </div>
  );
}
