import React from 'react';
import { 
  Globe, Server, Database, ArrowRight, CreditCard, 
  Zap, Shield, Radio 
} from 'lucide-react';

const ServiceCard = ({ name, port, color, icon: Icon, description }) => (
  <div className={`bg-white rounded-xl border-2 ${color} p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('border-', 'bg-').replace('500', '50')} ${color.replace('border-', 'text-')}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
        <span className="text-xs font-mono text-gray-400">:{port}</span>
      </div>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default function MicroservicesTopologySection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Microservices Topology</h2>
        <p className="text-gray-500 text-center mb-12">6 independently deployable services communicating via REST and Apache Kafka</p>

        {/* Frontend */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Globe className="w-5 h-5" /> React + Vite Frontend (:3000)
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-0.5 h-8 bg-gray-300"></div>
        </div>

        {/* API Gateway */}
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2">
            <Server className="w-5 h-5" /> API Gateway (:8080) — Redis Rate Limiting
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <div className="flex items-end gap-16">
            <div className="w-0.5 h-8 bg-gray-300"></div>
            <div className="w-0.5 h-8 bg-gray-300"></div>
            <div className="w-0.5 h-8 bg-gray-300"></div>
          </div>
        </div>

        {/* Core Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <ServiceCard name="Account Service" port="8081" color="border-green-500" icon={Database} description="Account CRUD, balance management, debit/credit operations. MySQL (account_db)." />
          <ServiceCard name="Transaction Service" port="8082" color="border-blue-500" icon={ArrowRight} description="Transfer orchestration, Saga coordinator, OTP verification. MySQL + Redis." />
          <ServiceCard name="Payment Service" port="8083" color="border-orange-500" icon={CreditCard} description="Razorpay integration, order creation, webhook processing. MySQL (payment_db)." />
        </div>

        {/* Kafka Bus */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-bold">Apache Kafka Event Bus</h3>
              <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-medium ml-2">10 Topics</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Asynchronous event-driven communication backbone connecting all services</p>
            <div className="flex flex-wrap gap-2">
              {['transaction.initiated', 'fraud.check.clean', 'verification.required', 'transaction.completed', 'transaction.refunded', 'transaction.otp.generated', 'fraud.detected', 'payment.completed', 'payment.failed'].map(topic => (
                <span key={topic} className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-700">{topic}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Event-driven Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard name="Fraud Detection Service" port="8084" color="border-red-500" icon={Shield} description="Real-time fraud scoring: velocity check, amount spike detection, balance percentage analysis. Redis-powered." />
          <ServiceCard name="Notification Service" port="8085" color="border-yellow-500" icon={Radio} description="Email notifications via Brevo SMTP: OTP, debit/credit alerts, fraud warnings, refund confirmations." />
        </div>
      </div>
    </section>
  );
}
