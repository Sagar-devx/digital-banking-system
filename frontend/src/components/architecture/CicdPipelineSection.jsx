import React from 'react';
import { ArrowRight } from 'lucide-react';

const PIPELINE_STEPS = [
  { label: 'Code Push', sub: 'Git Repository', color: 'bg-gray-900 text-white' },
  { label: 'Jenkins Test', sub: 'Maven + Docker', color: 'bg-blue-600 text-white' },
  { label: 'Docker Build', sub: '6 Service Images', color: 'bg-cyan-600 text-white' },
  { label: 'DockerHub', sub: 'sagr9900/*:latest', color: 'bg-purple-600 text-white' },
  { label: 'Deploy', sub: 'AWS EC2 via SSH', color: 'bg-orange-600 text-white' },
];

export default function CicdPipelineSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">CI/CD Pipeline</h2>
        <p className="text-gray-500 text-center mb-12">Automated build, test, and deployment to AWS EC2</p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className={`${step.color} rounded-xl px-6 py-4 text-center min-w-[140px] shadow-md`}>
                <div className="font-bold text-sm">{step.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{step.sub}</div>
              </div>
              {i < 4 && <ArrowRight className="w-5 h-5 text-gray-400 mx-2 hidden md:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
