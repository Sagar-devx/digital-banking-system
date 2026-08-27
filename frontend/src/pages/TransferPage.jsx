import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { accountApi } from '../api/accountApi';
import { transactionApi } from '../api/transactionApi';
import TransferInputForm from '../components/transfer/TransferInputForm';
import TransferConfirmStep from '../components/transfer/TransferConfirmStep';
import TransferProcessingStep from '../components/transfer/TransferProcessingStep';
import TransferOtpStep from '../components/transfer/TransferOtpStep';
import TransferSuccessStep from '../components/transfer/TransferSuccessStep';
import { extractErrorMessage } from '../utils/errorHandler';

export default function TransferPage() {
  const { currentAccount, refreshAccount } = useAccount();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('input');

  const resolvedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    receiverAccountNumber: '',
    amount: '',
    description: ''
  });
  
  const [error, setError] = useState('');

  const [processStep, setProcessStep] = useState(0);

  const [transactionId, setTransactionId] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [reviewLoading, setReviewLoading] = useState(false);

  const handleReview = async (e) => {
    e.preventDefault();
    const receiverAccountNumber = formData.receiverAccountNumber.trim();
    const amount = parseFloat(formData.amount);

    if (currentAccount?.status !== 'ACTIVE') {
      setError('Your account is currently blocked or inactive. You cannot initiate transfers.');
      return;
    }
    if (!/^\d{12}$/.test(receiverAccountNumber)) {
      setError('Enter a valid 12-digit recipient account number');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero');
      return;
    }
    if (amount > currentAccount?.balance) {
      setError('Insufficient funds');
      return;
    }

    setReviewLoading(true);
    try {
      const recipient = await accountApi.getAccountByNumber(receiverAccountNumber);
      if (recipient.status !== 'ACTIVE') {
        setError('Recipient account is not active');
        return;
      }
      setFormData((current) => ({ ...current, receiverAccountNumber }));
      setError('');
      setStep('confirm');
    } catch (err) {
      setError(extractErrorMessage(err, 'Recipient account was not found or is unavailable'));
    } finally {
      setReviewLoading(false);
    }
  };

  const handleTransfer = async () => {
    setError('');
    setStep('processing');
    setProcessStep(0);
    resolvedRef.current = false;

    try {
      const response = await transactionApi.transfer({
        senderAccountNumber: currentAccount.accountNumber,
        receiverAccountNumber: formData.receiverAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || 'Fund Transfer'
      });
      
      setTransactionId(response.id);
      
      setTimeout(() => setProcessStep(1), 500);
      
      pollTransactionStatus(response.id);
      
    } catch (err) {
      setError(extractErrorMessage(err, 'Transfer initiation failed'));
      setStep('input');
    }
  };

  const pollTransactionStatus = (id) => {
    let attempts = 0;
    const interval = setInterval(async () => {

      if (resolvedRef.current) {
        clearInterval(interval);
        return;
      }
      attempts++;
      try {
        const tx = await transactionApi.getTransaction(id);
        
        if (resolvedRef.current) return;
        
        if (tx.status === 'COMPLETED') {
          resolvedRef.current = true;
          clearInterval(interval);
          setProcessStep(2);
          setTimeout(() => {
            setStep('success');
            refreshAccount();
            setTimeout(() => navigate(`/transactions/${id}`), 1500);
          }, 500);
        } else if (tx.status === 'PENDING_VERIFICATION') {
          resolvedRef.current = true;
          clearInterval(interval);
          setStep('otp');
        } else if (tx.status === 'FAILED' || tx.status === 'FLAGGED') {
          resolvedRef.current = true;
          clearInterval(interval);
          let errorMsg = tx.failureReason || 'Declined';
          if (errorMsg.includes('SAGA Compensation')) {
            errorMsg = 'Transaction declined for security reasons. Any deducted amount has been safely refunded to your account.';
          } else {
            errorMsg = `Transfer failed: ${errorMsg}`;
          }
          setError(errorMsg);
          setStep('input');

          setTimeout(() => {
            refreshAccount();
          }, 1500);
        }
        
        if (attempts > 60) {
          resolvedRef.current = true;
          clearInterval(interval);
          setError('Transfer is taking too long. Please check transaction history.');
          setStep('input');
        }
      } catch (e) {
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        clearInterval(interval);
        setError(extractErrorMessage(e, 'Could not check transfer status. Please check your history.'));
        setStep('input');
      }
    }, 500);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value !== '' && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length !== 6) return;

    setError('');
    setStep('processing');
    setProcessStep(2);
    
    try {
      const response = await transactionApi.verifyOtp(transactionId, otpString);
      if (response.status === 'COMPLETED') {
        setStep('success');
        refreshAccount();
        setTimeout(() => navigate(`/transactions/${transactionId}`), 1500);
      } else {
        let errorMsg = response.failureReason || 'Account Blocked due to fraud';
        if (errorMsg.includes('SAGA Compensation')) {
          errorMsg = 'Transaction declined for security reasons. Any deducted amount has been safely refunded to your account.';
        } else {
          errorMsg = `Verification failed: ${errorMsg}`;
        }
        setError(errorMsg);
        setStep('input');

        setTimeout(() => {
          refreshAccount();
        }, 1500);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'OTP Verification failed'));
      setStep('otp');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Money</h1>
        <p className="text-gray-500">Send money securely from your account.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {step === 'input' && (
          <TransferInputForm 
            currentAccount={currentAccount}
            formData={formData}
            handleChange={handleChange}
            handleReview={handleReview}
            error={error}
            reviewLoading={reviewLoading}
          />
        )}

        {step === 'confirm' && (
          <TransferConfirmStep 
            formData={formData}
            currentAccount={currentAccount}
            onBack={() => setStep('input')}
            onConfirm={handleTransfer}
          />
        )}

        {step === 'processing' && (
          <TransferProcessingStep 
            processStep={processStep}
          />
        )}

        {step === 'otp' && (
          <TransferOtpStep 
            otpValues={otpValues}
            otpRefs={otpRefs}
            handleOtpChange={handleOtpChange}
            handleOtpKeyDown={handleOtpKeyDown}
            handleVerifyOtp={handleVerifyOtp}
            error={error}
          />
        )}

        {step === 'success' && (
          <TransferSuccessStep 
            amount={formData.amount}
            receiverAccountNumber={formData.receiverAccountNumber}
          />
        )}
      </div>
    </div>
  );
}
