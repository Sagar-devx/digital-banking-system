import React from 'react';
import { Zap, Shield, Server } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Enterprise Grade by Design</h2>
          <p className="text-lg text-gray-600">We rebuilt banking from the ground up using distributed systems to guarantee reliability, speed, and absolute security.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Event-Driven Transactions</h3>
            <p className="text-gray-600 leading-relaxed">
              Powered by Apache Kafka. Transactions are processed asynchronously as events, ensuring no dropped requests and allowing the system to handle massive scale under load.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Shield className="w-32 h-32" />
            </div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">Intelligent Fraud Detection</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              Real-time rule evaluation blocks suspicious transfers instantly. 
              Monitors frequency velocity, unusually large amounts, and high-risk accounts before money ever leaves.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Server className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Saga Pattern Reliability</h3>
            <p className="text-gray-600 leading-relaxed">
              Distributed transactions are managed via orchestration. If any step fails across our microservices, automated compensation triggers a secure rollback, guaranteeing data consistency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
