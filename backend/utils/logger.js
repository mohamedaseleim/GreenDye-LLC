/**
 * Simple logger utility for backend application
 * Provides consistent logging with environment awareness
 */

const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(...args); // eslint-disable-line no-console
    }
  },

  error: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(...args); // eslint-disable-line no-console
    }
  },

  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(...args); // eslint-disable-line no-console
    }
  },

  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args); // eslint-disable-line no-console
    }
  },
};

module.exports = logger;
