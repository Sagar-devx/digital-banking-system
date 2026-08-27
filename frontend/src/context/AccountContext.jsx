import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AccountContext = createContext();

export function AccountProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('digital_bank_account');
  });

  const fetchAccountDetails = useCallback(async (accountNumber, isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    }
    try {
      const response = await apiClient.get(`/api/v1/accounts/${accountNumber}`);
      setCurrentAccount(response.data);
      localStorage.setItem('digital_bank_account', accountNumber);
      return response.data;
    } catch (error) {
      console.error('Failed to load account:', error);
      setCurrentAccount(null);
      localStorage.removeItem('digital_bank_account');
      throw error;
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const savedAccount = localStorage.getItem('digital_bank_account');
    if (savedAccount) {
      fetchAccountDetails(savedAccount).catch(() => {});
    }
  }, [fetchAccountDetails]);

  const loginAccount = useCallback(async (accountNumber) => {
    return await fetchAccountDetails(accountNumber);
  }, [fetchAccountDetails]);

  const logoutAccount = useCallback(() => {
    setCurrentAccount(null);
    localStorage.removeItem('digital_bank_account');
  }, []);

  const refreshAccount = useCallback(() => {
    if (currentAccount?.accountNumber) {
      return fetchAccountDetails(currentAccount.accountNumber, true);
    }
    return Promise.resolve(null);
  }, [currentAccount, fetchAccountDetails]);

  return (
    <AccountContext.Provider value={{
      currentAccount,
      isLoading,
      loginAccount,
      logoutAccount,
      refreshAccount,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => useContext(AccountContext);

