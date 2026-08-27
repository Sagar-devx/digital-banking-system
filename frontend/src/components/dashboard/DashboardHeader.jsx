import React from 'react';

export default function DashboardHeader({ accountHolderName }) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex justify-between items-end">
      <div>
        <p className="text-gray-500 text-sm font-medium">{getTimeGreeting()},</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {accountHolderName}
        </h1>
      </div>
    </div>
  );
}
