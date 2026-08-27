import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TechStackMarquee from '../components/landing/TechStackMarquee';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ArchitecturePreview from '../components/landing/ArchitecturePreview';
import LandingFooter from '../components/landing/LandingFooter';
import AccessAccountModal from '../components/landing/AccessAccountModal';
import { extractErrorMessage } from '../utils/errorHandler';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginAccount } = useAccount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await loginAccount(accountNumber);
      setShowAccessModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Account not found or system unavailable.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>


      <LandingNavbar 
        isScrolled={isScrolled} 
        onOpenAccessModal={() => setShowAccessModal(true)} 
      />
      <HeroSection 
        onOpenAccessModal={() => setShowAccessModal(true)} 
      />
      <TechStackMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <ArchitecturePreview />
      <LandingFooter />
      <AccessAccountModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        handleAccess={handleAccess}
        loading={loading}
        error={error}
      />
    </div>
  );
}
