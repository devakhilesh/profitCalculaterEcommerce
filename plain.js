/* 

remaining jobs...

admin Subcription Routing 

user getAll Subscrition Plans

subscribed history  razorpay integration

rest will do on instruction 

*/

/* 
# Choose provider: 'metalsapi' or 'metalpriceapi' or 'goldapi'

*/

// conversion in gram

// https://metals-api.com/home

/* 
const js = {
  data: {
    base: "USD",
    rates: {
      XAG: 0.020838590380196,
      XAU: 0.00025728140713146,
    }
  }
};

const OUNCE_TO_GRAM = 31.1034768;

function inverseRate(rate) { return 1 / rate; }
function perGram(usdPerOunce) { return usdPerOunce / OUNCE_TO_GRAM; }

const xag = js.data.rates.XAG;
const xau = js.data.rates.XAU;

const silverUsdPerOunce = inverseRate(xag);
const silverPerGram = perGram(silverUsdPerOunce);

const goldUsdPerOunce = inverseRate(xau);
const goldPerGram = perGram(goldUsdPerOunce);

console.log({
  silver: {
    usdPerOunce: +silverUsdPerOunce.toFixed(2),
    usdPerGram: +silverPerGram.toFixed(2),
    usdPer10g: +(silverPerGram*10).toFixed(2)
  },
  gold: {
    usdPerOunce: +goldUsdPerOunce.toFixed(2),
    usdPerGram: +goldPerGram.toFixed(2),
    usdPer10g: +(goldPerGram*10).toFixed(2)
  }
});



*/


/* 

Need more research on this 

*/