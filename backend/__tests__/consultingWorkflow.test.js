const { assertTransition } = require('../utils/consultingWorkflow');
const { calculateInvoice } = require('../utils/invoiceCalculator');
describe('Consulting workflow hardening', () => {
  test('accepts a sent proposal', () => expect(() => assertTransition('proposal', 'sent', 'accepted')).not.toThrow());
  test('rejects an invalid proposal transition', () => expect(() => assertTransition('proposal', 'draft', 'accepted')).toThrow());
  test('calculates invoice totals on the server', () => {
    const result = calculateInvoice({ items: [{ description: 'Consulting', quantity: 2, unitPrice: 100 }], taxRate: 10, discount: 20 });
    expect(result).toMatchObject({ subtotal: 200, tax: 20, total: 200 });
  });
  test('rejects an excessive discount', () => expect(() => calculateInvoice({ items: [{ description: 'A', quantity: 1, unitPrice: 10 }], discount: 11 })).toThrow());
});
