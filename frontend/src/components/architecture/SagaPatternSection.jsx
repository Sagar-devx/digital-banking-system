import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';

const SagaStep = ({ step, label, description, status = 'done' }) => (
  <div className="flex items-start gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
        status === 'done' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'
      }`}>
        {step}
      </div>
      <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
    </div>
    <div className="pt-1">
      <h4 className="font-bold text-gray-900 text-sm">{label}</h4>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  </div>
);

export default function SagaPatternSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Saga Pattern — Distributed Transaction Flow</h2>
        <p className="text-gray-500 text-center mb-12">Orchestrated saga with compensation logic ensuring data consistency across services</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Happy Path */}
          <div>
            <div className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold mb-6">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Happy Path
            </div>
            <div className="space-y-0">
              <SagaStep step="1" label="Transfer Initiated" description="POST /transfer — Validate input, begin saga" />
              <SagaStep step="2" label="Debit Sender Account" description="Feign call to Account Service — deduct balance" />
              <SagaStep step="3" label="Kafka: transaction.initiated" description="Publish event to Fraud Detection Service" />
              <SagaStep step="4" label="Fraud Check Passed" description="Kafka: fraud.check.clean received" />
              <SagaStep step="5" label="Transaction Completed" description="Status → COMPLETED, credit receiver, send notifications" />
            </div>
          </div>

          {/* Compensation Path */}
          <div>
            <div className="inline-flex items-center bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-bold mb-6">
              <Shield className="w-3.5 h-3.5 mr-1.5" /> Compensation Path
            </div>
            <div className="space-y-0">
              <SagaStep step="1" label="Transfer Initiated" description="Sender balance deducted successfully" status="done" />
              <SagaStep step="2" label="Fraud Detection Flagged" description="Suspicious activity detected → OTP required" status="error" />
              <SagaStep step="3" label="OTP Verification" description="User enters incorrect OTP or OTP expires" status="error" />
              <SagaStep step="4" label="Saga Compensation Triggered" description="Credit back sender account, block if fraud" status="error" />
              <SagaStep step="5" label="Transaction Cancelled" description="Status → FLAGGED, refund notification sent" status="error" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
