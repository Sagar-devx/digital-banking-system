import React from 'react';
import ArchitectureHero from '../components/architecture/ArchitectureHero';
import MicroservicesTopologySection from '../components/architecture/MicroservicesTopologySection';
import KafkaEventFlowSection from '../components/architecture/KafkaEventFlowSection';
import SagaPatternSection from '../components/architecture/SagaPatternSection';
import TechStackSection from '../components/architecture/TechStackSection';
import DatabasePerServiceSection from '../components/architecture/DatabasePerServiceSection';
import CicdPipelineSection from '../components/architecture/CicdPipelineSection';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">
      <ArchitectureHero />
      <MicroservicesTopologySection />
      <KafkaEventFlowSection />
      <SagaPatternSection />
      <TechStackSection />
      <DatabasePerServiceSection />
      <CicdPipelineSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 text-center">
        <p className="text-sm">Built by <span className="text-white font-semibold">Sagar Sharma</span></p>
        <p className="text-xs mt-2">Digital Banking System — Microservices + Event-Driven Architecture</p>
      </footer>
    </div>
  );
}
