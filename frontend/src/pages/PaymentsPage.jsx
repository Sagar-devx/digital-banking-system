import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { paymentApi } from '../api/paymentApi';
import PaymentTopupForm from '../components/payments/PaymentTopupForm';
import { extractErrorMessage } from '../utils/errorHandler';

export default function PaymentsPage() {
  const { currentAccount, refreshAccount } = useAccount();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input');

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const order = await paymentApi.createOrder({
        accountNumber: currentAccount.accountNumber,
        amount: parseFloat(amount),
        description: description || 'Account Top-up'
      });

      let isSuccess = false;

      const options = {
        key: order.razorpayKeyId,
        amount: parseFloat(order.amount) * 100,
        currency: order.currency,
        name: "DigitalBank",
        description: description || "Account Top-up",
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          isSuccess = true;
          setStep('processing');
          setError('');
          try {
            await paymentApi.confirmPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            await refreshAccount();
            
            setStep('success');
            setTimeout(() => {
              navigate('/dashboard', { state: { success: true, paymentId: response.razorpay_payment_id } });
            }, 2500);
          } catch (error) {
            setError(extractErrorMessage(error, 'Payment succeeded, but balance could not be updated immediately.'));
            setStep('input');
          }
        },
        prefill: {
          name: currentAccount.accountHolderName,
          email: currentAccount.email,
          contact: currentAccount.phone
        },
        theme: {
          color: "#16a34a"
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          if (!isSuccess) {
            setError(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
          }
        });
        rzp.open();
      } else {
        alert('Razorpay SDK not found! In a real app, include https://checkout.razorpay.com/v1/checkout.js in index.html');
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to create payment order');
      if (errorMsg.includes('Razorpay') || errorMsg.includes('gateway') || err.response?.status === 502) {
        setError('Payment gateway error. Please ensure Razorpay API keys (key-id and key-secret) are configured properly.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Money</h1>
        <p className="text-gray-500">Top up your account securely via Razorpay.</p>
      </div>

      {step === 'input' && (
        <PaymentTopupForm 
          amount={amount}
          setAmount={setAmount}
          description={description}
          setDescription={setDescription}
          loading={loading}
          error={error}
          handleCreateOrder={handleCreateOrder}
        />
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Verifying Payment</h3>
          <p className="text-gray-500">
            Please wait while we confirm your transaction securely...
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Top-up Successful!</h3>
          <p className="text-gray-500">
            ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to your account.
          </p>
          <p className="text-sm text-gray-400 animate-pulse mt-8">
            Redirecting to dashboard...
          </p>
        </div>
      )}
    </div>
  );
}
