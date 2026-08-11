// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:5000';

// Deterministic Axios mock for direct calls and axios.create instances.
jest.mock('axios', () => {
  const client = jest.fn(() => Promise.resolve({ data: { data: [] } }));
  client.get = jest.fn(() => Promise.resolve({ data: { data: [] } }));
  client.post = jest.fn(() => Promise.resolve({ data: { data: {} } }));
  client.put = jest.fn(() => Promise.resolve({ data: { data: {} } }));
  client.delete = jest.fn(() => Promise.resolve({ data: { data: {} } }));
  client.interceptors = {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  };
  client.create = jest.fn(() => client);
  return client;
});
