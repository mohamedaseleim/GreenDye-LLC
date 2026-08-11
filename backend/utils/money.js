const decimalPlaces={BHD:3,JOD:3,KWD:3,OMR:3,TND:3,CLF:4,JPY:0,KRW:0,VND:0};
const currencyCode=value=>{const code=String(value||'USD').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(code))throw Object.assign(new Error('Invalid currency code'),{statusCode:400});return code};
const scaleFor=currency=>10**(decimalPlaces[currencyCode(currency)]??2);
const toMinor=(value,currency)=>{const number=Number(value);if(!Number.isFinite(number))throw Object.assign(new Error('Invalid monetary amount'),{statusCode:400});return Math.round(number*scaleFor(currency))};
const fromMinor=(minor,currency)=>Number((Number(minor)/scaleFor(currency)).toFixed(decimalPlaces[currencyCode(currency)]??2));
module.exports={currencyCode,scaleFor,toMinor,fromMinor};
