import React from 'react';
import { HardDrive, CheckCircle, Radio } from 'lucide-react';

export default function SystemMetricsSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-dark-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HardDrive className="w-32 h-32" />
        </div>
        <h3 className="text-lg font-bold mb-6 relative z-10">Tech Stack</h3>
        <ul className="space-y-4 text-gray-300 text-sm relative z-10">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-primary-400 mr-3 shrink-0" />
            <span><strong className="text-white">Event-Driven:</strong> Apache Kafka powers async workflows (Notifications, Saga).</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-primary-400 mr-3 shrink-0" />
            <span><strong className="text-white">Saga Pattern:</strong> Distributed transactions ensure data consistency.</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-primary-400 mr-3 shrink-0" />
            <span><strong className="text-white">Redis:</strong> Powers the API Gateway Rate Limiting and OTP cache.</span>
          </li>
        </ul>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mr-4">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Topics</p>
            <p className="text-xl font-bold text-gray-900">4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
