import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccountProvider, useAccount } from './context/AccountContext';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TransferPage = React.lazy(() => import('./pages/TransferPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const TransactionDetailPage = React.lazy(() => import('./pages/TransactionDetailPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const SystemHealthPage = React.lazy(() => import('./pages/SystemHealthPage'));
const CreateAccountPage = React.lazy(() => import('./pages/CreateAccountPage'));
const ArchitecturePage = React.lazy(() => import('./pages/ArchitecturePage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentAccount, isLoading } = useAccount();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!currentAccount) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/accounts/create" element={<CreateAccountPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transfer" element={<TransferPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/system" element={<SystemHealthPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AccountProvider>
    </BrowserRouter>
  );
}

export default App;
