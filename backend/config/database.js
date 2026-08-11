const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 20,
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 2,
    autoIndex: process.env.NODE_ENV !== 'production'
  });
  logger.info('mongodb.connected', { host: connection.connection.host, database: connection.connection.name });
  return connection;
};
