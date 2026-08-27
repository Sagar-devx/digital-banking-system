import React from 'react';
import { Radio } from 'lucide-react';

const KafkaTopic = ({ topic, from, to, color = 'text-blue-600' }) => (
  <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
    <Radio className={`w-4 h-4 ${color} shrink-0`} />
    <div className="flex-1 min-w-0">
      <p className="font-mono text-xs font-semibold text-gray-900 truncate">{topic}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{from} → {to}</p>
    </div>
  </div>
);

export default function KafkaEventFlowSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Kafka Event Flow</h2>
        <p className="text-gray-500 text-center mb-12">Complete event topology showing producers, consumers, and message routing</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <KafkaTopic topic="transaction.initiated" from="Transaction Svc" to="Fraud Detection" color="text-blue-600" />
          <KafkaTopic topic="fraud.check.clean" from="Fraud Detection" to="Transaction Svc" color="text-green-600" />
          <KafkaTopic topic="verification.required" from="Fraud Detection" to="Transaction Svc" color="text-yellow-600" />
          <KafkaTopic topic="transaction.completed" from="Transaction Svc" to="Account + Notification" color="text-green-600" />
          <KafkaTopic topic="transaction.refunded" from="Transaction Svc" to="Notification Svc" color="text-orange-600" />
          <KafkaTopic topic="transaction.otp.generated" from="Transaction Svc" to="Notification Svc" color="text-purple-600" />
          <KafkaTopic topic="fraud.detected" from="Transaction Svc" to="Account Svc (block)" color="text-red-600" />
          <KafkaTopic topic="payment.completed" from="Payment Svc" to="Notification Svc" color="text-green-600" />
          <KafkaTopic topic="payment.failed" from="Payment Svc" to="Notification Svc" color="text-red-600" />
        </div>
      </div>
    </section>
  );
}
