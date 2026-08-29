import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { transactionApi } from '../api/transactionApi';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardBalanceCard from '../components/dashboard/DashboardBalanceCard';
import AccountDetailsCard from '../components/dashboard/AccountDetailsCard';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentAccount } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(!!currentAccount);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        if (currentAccount?.accountNumber) {
          const txns = await transactionApi.getAccountTransactions(currentAccount.accountNumber);
          if (!cancelled) {
            const txnList = Array.isArray(txns) ? txns : [];
            setTransactions(txnList.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (!cancelled) setError('Failed to load recent transactions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    if (currentAccount && currentAccount.accountNumber) {
      loadDashboard();
    } else {
      setTimeout(() => setLoading(false), 0); // avoid synchronous state update warning
    }

    return () => { cancelled = true; };
  }, [currentAccount]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentAccount) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Active Account Found</h2>
        <p className="text-gray-500 mb-8">Create an account to start managing your money.</p>
        <button
          onClick={() => navigate('/accounts/create')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <DashboardHeader accountHolderName={currentAccount.accountHolderName} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardBalanceCard currentAccount={currentAccount} />
        <AccountDetailsCard currentAccount={currentAccount} />
      </div>

      <QuickActionsWidget navigate={navigate} />
      <RecentTransactionsWidget 
        transactions={transactions}
        currentAccount={currentAccount}
        error={error}
        navigate={navigate}
      />
    </div>
  );
}
