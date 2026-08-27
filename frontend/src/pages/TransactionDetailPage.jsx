import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionApi } from '../api/transactionApi';
import { ArrowLeft } from 'lucide-react';
import TransactionDetailBanner from '../components/transactions/TransactionDetailBanner';
import TransactionInfoCard from '../components/transactions/TransactionInfoCard';
import SagaTimelineWidget from '../components/transactions/SagaTimelineWidget';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadTxn = async () => {
      setLoading(true);
      try {
        const data = await transactionApi.getTransaction(id);
        if (!cancelled) setTxn(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTxn();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-96"></div>
      </div>
    );
  }

  if (!txn) return <div className="p-8 text-center text-red-500 font-medium">Transaction not found</div>;

  const isFailed = txn.status === 'FAILED' || txn.status === 'FLAGGED';
  const isPending = txn.status === 'PENDING' || txn.status === 'PROCESSING' || txn.status === 'PENDING_VERIFICATION';
  const isCompleted = txn.status === 'COMPLETED';

  const getTimelineSteps = () => {
    const steps = [
      { label: 'Transfer Initiated', description: 'Sender account validation', status: 'done' },
      { label: 'Account Debit', description: 'Funds deducted from source', status: 'done' }
    ];

    if (isCompleted) {
      steps.push({ label: 'Fraud Check Passed', description: 'Transaction verified', status: 'done' });
      steps.push({ label: 'Account Credit', description: 'Funds added to destination', status: 'done' });
      steps.push({ label: 'Transaction Completed', description: 'All steps finished successfully', status: 'done' });
    } else if (txn.status === 'PENDING_VERIFICATION') {
      steps.push({ label: 'Fraud Detection Flagged', description: 'Suspicious activity detected', status: 'error' });
      steps.push({ label: 'OTP Verification Required', description: 'Waiting for user input', status: 'current' });
    } else if (isFailed) {
      steps.push({ label: 'Fraud Detection / Validation Failed', description: txn.failureReason || 'Declined', status: 'error' });
      steps.push({ label: 'Saga Compensation', description: 'Sender account refunded', status: 'done' });
      steps.push({ label: 'Transaction Cancelled', description: 'Workflow aborted', status: 'error' });
    } else {
      steps.push({ label: 'Processing', description: 'Validating with internal services...', status: 'current' });
    }

    return steps;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/transactions" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:shadow">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to transactions
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <TransactionDetailBanner 
          txn={txn}
          isFailed={isFailed}
          isCompleted={isCompleted}
          isPending={isPending}
          formatCurrency={formatCurrency}
        />
        <div className="grid grid-cols-1 md:grid-cols-2">
          <TransactionInfoCard txn={txn} />
          <SagaTimelineWidget steps={getTimelineSteps()} />
        </div>
      </div>
    </div>
  );
}
