import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { transactionApi } from '../api/transactionApi';
import TransactionHeader from '../components/transactions/TransactionHeader';
import TransactionMobileList from '../components/transactions/TransactionMobileList';
import TransactionDesktopTable from '../components/transactions/TransactionDesktopTable';

export default function TransactionsPage() {
  const { currentAccount } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        if (currentAccount?.accountNumber) {
          const txns = await transactionApi.getAccountTransactions(currentAccount.accountNumber);
          if (!cancelled) {
            setTransactions(Array.isArray(txns) ? txns : []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [currentAccount?.accountNumber]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const filteredTxns = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.includes(searchTerm) ||
                          t.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      <TransactionHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={transactions.length}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <TransactionMobileList 
          loading={loading}
          filteredTxns={filteredTxns}
          currentAccount={currentAccount}
          formatCurrency={formatCurrency}
        />
        <TransactionDesktopTable 
          loading={loading}
          filteredTxns={filteredTxns}
          currentAccount={currentAccount}
          formatCurrency={formatCurrency}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
