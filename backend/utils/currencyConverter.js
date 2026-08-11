const axios = require('axios');
const logger = require('./logger');

// Cache for exchange rates (24 hour TTL)
const exchangeRatesCache = {
  rates: {},
  lastUpdate: null
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch latest exchange rates from public API
 * @returns {Promise<Object>}
 */
async function fetchExchangeRates() {
  try {
    // Check cache first
    const now = Date.now();
    if (exchangeRatesCache.lastUpdate && (now - exchangeRatesCache.lastUpdate) < CACHE_TTL_MS) {
      return exchangeRatesCache.rates;
    }

    // Fetch from public API (no API key needed)
    // Using exchangerate-api.com free tier
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    });
    
    if (response.data && response.data.rates) {
      exchangeRatesCache.rates = response.data.rates;
      exchangeRatesCache.lastUpdate = now;
      return response.data.rates;
    }
    
    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    logger.error('Failed to fetch exchange rates:', error.message);
    
    // Return cached rates if available, even if expired
    if (exchangeRatesCache.rates && Object.keys(exchangeRatesCache.rates).length > 0) {
      logger.warn('Using cached exchange rates due to API error');
      return exchangeRatesCache.rates;
    }
    
    throw error;
  }
}

/**
 * Convert an amount from one currency to another.  If the conversion
 * fails or the currencies are equal, the original amount is returned.
 *
 * @param {number} amount
 * @param {string} fromCurrency - 3-letter currency code (e.g., 'USD', 'EUR')
 * @param {string} toCurrency - 3-letter currency code (e.g., 'USD', 'EUR')
 * @returns {Promise<number>}
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (!amount || fromCurrency === toCurrency) return amount;
  
  try {
    const rates = await fetchExchangeRates();
    
    // Convert both to uppercase for consistency
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();
    
    // Check if currencies are supported
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      logger.warn(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
      return amount;
    }
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / rates[fromCurrency];
    const convertedAmount = amountInUSD * rates[toCurrency];
    
    return Number(convertedAmount.toFixed(2));
  } catch (error) {
    logger.error('Currency conversion error:', error.message);
    return amount;
  }
}

module.exports = { convertCurrency };
