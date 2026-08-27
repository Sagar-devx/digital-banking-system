import React from 'react';
import { Activity, Shield, Server, CheckCircle } from 'lucide-react';

const STEPS = [
  { step: 1, title: 'Initiate Transfer', desc: 'Request validated and sent to API Gateway', icon: Activity },
  { step: 2, title: 'Fraud Analysis', desc: 'Rules engine evaluates risk in real-time', icon: Shield },
  { step: 3, title: 'Saga Orchestration', desc: 'Funds held while target is verified', icon: Server },
  { step: 4, title: 'Secure Completion', desc: 'Event published, balances updated', icon: CheckCircle }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Lifecycle of a Secure Transfer</h2>
          <p className="text-lg text-gray-600">See exactly what happens behind the scenes in milliseconds.</p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((item, idx) => (
              <div key={idx} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mb-4 shadow-lg shadow-primary-500/30">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
