import React from 'react';
import { Workflow } from 'lucide-react';

export default function ArchitectureHero() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6 backdrop-blur-sm">
          <Workflow className="w-3.5 h-3.5 mr-2 text-primary-400" /> Distributed Event-Driven Architecture
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          System Architecture
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          A production-grade distributed banking platform built with microservices, event-driven messaging, and the Saga pattern for reliable distributed transactions.
        </p>
      </div>
    </section>
  );
}
