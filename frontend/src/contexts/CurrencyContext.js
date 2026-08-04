import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * CurrencyContext provides a simple way for the application to
 * track the currently selected currency and expose helpers for
 * formatting prices. When the currency changes we persist the
 * selection to localStorage so that returning users see the same
 * currency they previously chose.
 */
const CurrencyContext = createContext();

/**
 * Custom hook to access the currency context. Throws an error if
 * used outside of a CurrencyProvider to aid debugging.
 */
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

/**
 * Provider component that manages the selected currency. It also
 * exposes a formatPrice function which uses the built‑in
 * Intl.NumberFormat API to display amounts according to the
 * chosen currency. When the amount is zero we display "Free" to
 * mirror existing UI behaviour.
 */
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('currency') || 'USD'
      : 'USD'
  );

  // Persist currency changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('currency', currency);
    } catch (e) {
      // localStorage may not be available (e.g. in SSR); ignore
    }
  }, [currency]);

  const changeCurrency = (cur) => {
    setCurrency(cur);
  };

  /**
   * Format a numeric amount into a currency string. The default
   * currency parameter uses the currently selected currency from
   * context. If Intl.NumberFormat throws (for unknown currency
   * codes), we fall back to a simple prefix format.
   */
  const formatPrice = (amount, cur = currency) => {
    if (amount === null || amount === undefined) {
      return '';
    }
    if (amount === 0) {
      return 'Free';
    }
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: cur,
      }).format(amount);
    } catch (e) {
      // Fallback: prefix the amount with the currency code
      return `${cur} ${Number(amount).toFixed(2)}`;
    }
  };

  const value = {
    currency,
    changeCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
