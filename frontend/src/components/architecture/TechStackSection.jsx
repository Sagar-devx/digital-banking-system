import React from 'react';
import { 
  Globe, Server, Zap, Database, Container, GitBranch, CreditCard 
} from 'lucide-react';

const TechCard = ({ name, description, icon: Icon, color }) => (
  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all hover:-translate-y-1 duration-300">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="font-bold text-white text-sm mb-1">{name}</h4>
    <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default function TechStackSection() {
  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Technology Stack</h2>
        <p className="text-gray-400 text-center mb-12">Production-grade technologies powering the platform</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TechCard name="React + Vite" description="Modern SPA with code splitting, lazy loading" icon={Globe} color="bg-blue-500/20 text-blue-400" />
          <TechCard name="Spring Boot 4.1" description="Java 17 microservices framework" icon={Server} color="bg-green-500/20 text-green-400" />
          <TechCard name="Apache Kafka" description="Event-driven async messaging" icon={Zap} color="bg-orange-500/20 text-orange-400" />
          <TechCard name="Redis" description="Rate limiting, OTP, fraud velocity" icon={Database} color="bg-red-500/20 text-red-400" />
          <TechCard name="MySQL 8.0" description="Database per service pattern" icon={Database} color="bg-blue-500/20 text-blue-400" />
          <TechCard name="Docker" description="Containerized microservices" icon={Container} color="bg-cyan-500/20 text-cyan-400" />
          <TechCard name="Jenkins" description="CI/CD pipeline to AWS EC2" icon={GitBranch} color="bg-yellow-500/20 text-yellow-400" />
          <TechCard name="Razorpay" description="Payment gateway integration" icon={CreditCard} color="bg-purple-500/20 text-purple-400" />
        </div>
      </div>
    </section>
  );
}
