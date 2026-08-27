import React from 'react';
import { CheckCircle, Globe, ArrowRight, Database } from 'lucide-react';

export default function ArchitecturePreview() {
  return (
    <section id="architecture" className="py-24 bg-dark-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Designed for Resilience</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Our microservices architecture ensures that DigitalBank remains available even during partial outages. With Apache Kafka handling inter-service communication and Redis caching frequently accessed data, we deliver a 99.99% uptime SLA.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                API Gateway Pattern for secure routing
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                CQRS for optimized read/write operations
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                Outbox Pattern for reliable event publishing
              </li>
            </ul>
          </div>
          
          <div className="bg-dark-800 p-8 rounded-[2rem] border border-gray-700 shadow-2xl relative">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-xl font-mono text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> React Frontend
                </div>
              </div>
              <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-gray-600 rotate-90" /></div>
              <div className="flex justify-center">
                <div className="bg-primary-500/10 border border-primary-500/30 text-primary-400 px-6 py-3 rounded-xl font-mono text-sm w-full text-center">
                  API Gateway / Load Balancer
                </div>
              </div>
              <div className="flex justify-between px-8">
                <ArrowRight className="w-5 h-5 text-gray-600 rotate-[135deg]" />
                <ArrowRight className="w-5 h-5 text-gray-600 rotate-90" />
                <ArrowRight className="w-5 h-5 text-gray-600 rotate-[45deg]" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700/50 border border-gray-600 text-gray-300 p-4 rounded-xl text-center text-xs font-mono">Account<br/>Service</div>
                <div className="bg-gray-700/50 border border-gray-600 text-gray-300 p-4 rounded-xl text-center text-xs font-mono">Transaction<br/>Service</div>
                <div className="bg-gray-700/50 border border-gray-600 text-gray-300 p-4 rounded-xl text-center text-xs font-mono">Fraud<br/>Service</div>
              </div>
              <div className="flex justify-center mt-2"><Database className="w-6 h-6 text-orange-500" /></div>
              <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-3 rounded-xl text-center text-xs font-mono w-full">
                Apache Kafka Event Broker
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
