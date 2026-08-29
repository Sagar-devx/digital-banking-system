import React from 'react';
import { Send, Plus, History, CreditCard } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function QuickActionsWidget({ navigate }) {
  const actions = [
    { icon: Send, label: 'Send Money', onClick: () => navigate('/transfer'), color: 'bg-blue-50 text-blue-600' },
    { icon: Plus, label: 'Add Funds', onClick: () => navigate('/payments'), color: 'bg-green-50 text-green-600' },
    { icon: History, label: 'History', onClick: () => navigate('/transactions'), color: 'bg-purple-50 text-purple-600' },
    { icon: CreditCard, label: 'Payments', onClick: () => navigate('/payments'), color: 'bg-orange-50 text-orange-600' }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all duration-200"
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", action.color)}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
