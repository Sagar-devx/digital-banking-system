import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi } from '../api/accountApi';
import { AlertCircle } from 'lucide-react';
import AccountFormStepper from '../components/accounts/AccountFormStepper';
import StepPersonalInfo from '../components/accounts/StepPersonalInfo';
import StepDepositInfo from '../components/accounts/StepDepositInfo';
import AccountSuccessCard from '../components/accounts/AccountSuccessCard';

import { extractErrorMessage } from '../utils/errorHandler';
import { useAccount } from '../context/AccountContext';

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const { loginAccount } = useAccount();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    accountHolderName: '',
    email: '',
    phone: '',
    accountType: 'SAVINGS',
    initialDeposit: ''
  });
  
  const [createdAccount, setCreatedAccount] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.accountHolderName.trim()) return "Full name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return "Valid email is required";
    if (!formData.phone.trim()) return "Phone number is required";
    return null;
  };

  const validateStep2 = () => {
    if (isNaN(parseFloat(formData.initialDeposit)) || parseFloat(formData.initialDeposit) < 0) {
      return "Initial deposit must be a positive number";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        ...formData,
        initialDeposit: parseFloat(formData.initialDeposit)
      };
      
      const account = await accountApi.createAccount(payload);
      setCreatedAccount(account);
      try {
        await loginAccount(account.accountNumber);
      } catch (e) {
        console.error('Auto-login failed', e);
      }
      setStep(3); // Success step
    } catch (err) {
      console.error('Failed to create account:', err);
      const errorMsg = extractErrorMessage(err, 'Failed to create account. Please try again.');
      setError(errorMsg);

      if (
        errorMsg.toLowerCase().includes('email') ||
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('phone') ||
        errorMsg.toLowerCase().includes('name')
      ) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdAccount?.accountNumber) {
      navigator.clipboard.writeText(createdAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Open a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join DigitalBank in just a few simple steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Stepper indicator */}
          <AccountFormStepper step={step} />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            {step === 1 && (
              <StepPersonalInfo 
                formData={formData}
                handleChange={handleChange}
                onContinue={handleNext}
              />
            )}

            {step === 2 && (
              <StepDepositInfo 
                formData={formData}
                handleChange={handleChange}
                onBack={() => setStep(1)}
                loading={loading}
              />
            )}

            {step === 3 && createdAccount && (
              <AccountSuccessCard 
                createdAccount={createdAccount}
                copied={copied}
                copyToClipboard={copyToClipboard}
                onGoToDashboard={() => navigate('/dashboard')}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
