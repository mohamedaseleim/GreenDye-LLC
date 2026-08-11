import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

const CurrencyContext = createContext(null);
const SUPPORTED_CURRENCIES = new Set(['USD', 'EUR', 'EGP', 'SAR', 'AED', 'GBP']);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

const initialCurrency = () => {
  if (typeof window === 'undefined') return 'USD';
  try {
    const stored = localStorage.getItem('currency');
    return SUPPORTED_CURRENCIES.has(stored) ? stored : 'USD';
  } catch {
    return 'USD';
  }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(initialCurrency);

  useEffect(() => {
    try { localStorage.setItem('currency', currency); } catch { /* Storage can be unavailable. */ }
  }, [currency]);

  const changeCurrency = useCallback(value => {
    const normalized = String(value || '').toUpperCase();
    if (!SUPPORTED_CURRENCIES.has(normalized)) throw new Error('Unsupported currency');
    setCurrency(normalized);
  }, []);

  const formatPrice = useCallback((amount, selectedCurrency = currency, locale) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return '';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: selectedCurrency,
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `${selectedCurrency} ${numericAmount.toFixed(2)}`;
    }
  }, [currency]);

  const value = useMemo(() => ({ currency, changeCurrency, formatPrice }), [currency, changeCurrency, formatPrice]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
