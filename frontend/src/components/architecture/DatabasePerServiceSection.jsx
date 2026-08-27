import React from 'react';
import { Database, Shield, Radio } from 'lucide-react';

const DB_SERVICES = [
  { service: 'Account Service', db: 'MySQL — account_db', icon: Database, desc: 'Accounts table with balances, status, limits' },
  { service: 'Transaction Service', db: 'MySQL — transaction_db + Redis', icon: Database, desc: 'Transactions table + Redis OTP storage (5min TTL)' },
  { service: 'Payment Service', db: 'MySQL — payment_db', icon: Database, desc: 'Payments table with Razorpay order/payment IDs' },
  { service: 'Fraud Detection', db: 'Redis (stateless)', icon: Shield, desc: 'Velocity counters (60s TTL) + running avg amounts' },
  { service: 'Notification Service', db: 'None (stateless)', icon: Radio, desc: 'Fire-and-forget email dispatch via Brevo SMTP' },
];

export default function DatabasePerServiceSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Database per Service Pattern</h2>
        <p className="text-gray-500 text-center mb-12">Each microservice owns its data store for true independence</p>

        <div className="space-y-3">
          {DB_SERVICES.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <item.icon className="w-8 h-8 text-gray-400 shrink-0" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h4 className="font-bold text-gray-900 text-sm">{item.service}</h4>
                  <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{item.db}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
