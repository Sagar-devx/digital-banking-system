import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import SystemHealthHeader from '../components/system-health/SystemHealthHeader';
import ServiceHealthGrid from '../components/system-health/ServiceHealthGrid';
import ServiceTopologyDiagram from '../components/system-health/ServiceTopologyDiagram';
import SystemMetricsSidebar from '../components/system-health/SystemMetricsSidebar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const SERVICES = [
  { id: 'gateway', name: 'API Gateway', url: `${API_BASE}/actuator/health`, port: '8080' },
  { id: 'account', name: 'Account Service', url: `${API_BASE}/health/account`, port: '8081' },
  { id: 'transaction', name: 'Transaction Service', url: `${API_BASE}/health/transaction`, port: '8082' },
  { id: 'payment', name: 'Payment Service', url: `${API_BASE}/health/payment`, port: '8083' },
  { id: 'fraud', name: 'Fraud Detection', url: `${API_BASE}/health/fraud`, port: '8084' },
  { id: 'notification', name: 'Notification Service', url: `${API_BASE}/health/notification`, port: '8085' },
];

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      SERVICES.map(async (service) => {
        const sTime = performance.now();
        try {
          const res = await axios.get(service.url, { timeout: 3000 });
          const latency = Math.round(performance.now() - sTime);
          return { ...service, status: res.data?.status || 'UP', error: null, latency };
        } catch (err) {
          return { ...service, status: 'DOWN', error: err.message, latency: null };
        }
      })
    );
    setHealthData(results);
    setLastChecked(new Date());
    setLoading(false);
    setCountdown(30);
  }, []);

  useEffect(() => {
    checkHealth();
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="max-w-6xl mx-auto py-8">

      <SystemHealthHeader 
        lastChecked={lastChecked}
        countdown={countdown}
        loading={loading}
        onRunDiagnostics={checkHealth}
      />
      <ServiceHealthGrid healthData={healthData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ServiceTopologyDiagram />
        <SystemMetricsSidebar />
      </div>
    </div>
  );
}
