const {calculatePaymentTerms}=require('../utils/paymentTerms');

test('recalculating terms after a price change preserves exact minor-unit total',()=>{
  const original=calculatePaymentTerms([{label:'Start',percentage:40},{label:'Delivery',percentage:60}],100,'USD');
  expect(original.reduce((sum,row)=>sum+row.amountMinor,0)).toBe(10000);
  const revised=calculatePaymentTerms(original,127.37,'USD');
  expect(revised.reduce((sum,row)=>sum+row.amountMinor,0)).toBe(12737);
  expect(revised.map(row=>row.percentage)).toEqual([40,60]);
});

test('invalid payment term percentages are rejected',()=>{
  expect(()=>calculatePaymentTerms([{percentage:50},{percentage:40}],100,'USD')).toThrow('must total 100%');
});
