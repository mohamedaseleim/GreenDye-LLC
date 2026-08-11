const {canonicalJson}=require('../utils/canonicalJson');const {calculatePaymentTerms}=require('../utils/paymentTerms');
test('canonical JSON ignores object key order',()=>expect(canonicalJson({b:2,a:{d:4,c:3}})).toBe(canonicalJson({a:{c:3,d:4},b:2})));
test('payment stages always reconcile',()=>{const x=calculatePaymentTerms([{percentage:33.33},{percentage:33.33},{percentage:33.34}],1,'USD');expect(x.reduce((n,v)=>n+v.amountMinor,0)).toBe(100)});
