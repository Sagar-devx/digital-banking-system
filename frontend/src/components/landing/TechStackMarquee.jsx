import React from 'react';
import { Database } from 'lucide-react';

const UNIQUE_TECH = [
  "React 19", "Spring Boot 4", "Apache Kafka", "Redis", 
  "Docker", "MySQL", "Microservices", "Saga Pattern",
  "Vite", "Tailwind CSS", "API Gateway", "Java", "Axios"
];

const TECH_STACK = [...UNIQUE_TECH, ...UNIQUE_TECH];

export default function TechStackMarquee() {
  return (
    <section className="py-10 border-y border-gray-200 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-center">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Powered by Enterprise Technologies</p>
      </div>
      <div className="relative flex overflow-x-hidden group">
        <div className="py-4 animate-marquee whitespace-nowrap flex gap-12 items-center px-6" style={{ width: 'max-content' }}>
          {TECH_STACK.map((tech, i) => (
            <span key={i} className="text-xl font-bold text-gray-300 flex items-center gap-2">
              <Database className="w-5 h-5" /> {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
