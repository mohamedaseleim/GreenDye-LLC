/* eslint-disable no-console */
const write = (level, event, metadata = {}) => {
  if (process.env.NODE_ENV === 'test') return;
  const record = { timestamp: new Date().toISOString(), level, event: String(event), instanceId: process.env.INSTANCE_ID, ...metadata };
  const output = JSON.stringify(record);
  if (level === 'error') console.error(output); else if (level === 'warn') console.warn(output); else console.log(output);
};
module.exports = {
  info: (event, metadata) => write('info', event, metadata),
  warn: (event, metadata) => write('warn', event, metadata),
  error: (event, metadata) => write('error', event, metadata),
  debug: (event, metadata) => { if (process.env.NODE_ENV === 'development') write('debug', event, metadata); }
};
