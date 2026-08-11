const axios = require('axios');

const FIXER_API_KEY = process.env.FIXER_API_KEY || '';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const ratesCache = {};

/**
 * Fetch exchange rates. When using Fixer.io the base currency is fixed to EUR.
 * Without a Fixer API key we default to exchangerate.host, which lets us specify any base.
 */
async function fetchRates(base = 'USD') {
  // use cache if available and not stale
  const cached = ratesCache[base];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }

  let url;
  if (FIXER_API_KEY) {
    url = `http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}`;
    // Fixer only supports EUR as base for free plans; we will convert manually
  } else {
    url = `https://api.exchangerate.host/latest?base=${base}`;
  }

  const response = await axios.get(url);
  const data = response.data;

  if (!data || !data.rates) {
    throw new Error('Failed to fetch exchange rates');
  }

  const rates = data.rates;
  // store rates in cache with timestamp
  ratesCache[base] = { rates, timestamp: Date.now() };
  return rates;
}

/**
 * Convert an amount from one currency to another.
 *
 * - When using exchangerate.host (no API key) we simply multiply by the target rate.
 * - When using Fixer.io (free plan) we first normalise to EUR and then to the target.
 */
async function convert(amount, from, to) {
  const fromCur = from.toUpperCase();
  const toCur = to.toUpperCase();

  if (fromCur === toCur) {
    return amount;
  }

  if (FIXER_API_KEY) {
    // Fetch EUR-based rates once
    const rates = await fetchRates();
    const rateFrom = rates[fromCur];
    const rateTo = rates[toCur];
    if (!rateFrom || !rateTo) {
      throw new Error(`Unsupported currency conversion ${fromCur} -> ${toCur}`);
    }
    // Convert from the base (EUR) via cross rates: amount_from * (rateTo / rateFrom)
    return amount / rateFrom * rateTo;
  }

  // exchangerate.host supports specifying base currency directly
  const rates = await fetchRates(fromCur);
  const targetRate = rates[toCur];
  if (!targetRate) {
    throw new Error(`Unsupported currency conversion ${fromCur} -> ${toCur}`);
  }
  return amount * targetRate;
}

module.exports = { convert };
