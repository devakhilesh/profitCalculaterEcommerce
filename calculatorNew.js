// const input = {
//   productCost: 118,
//   package: 10,
//   ads: 32,
//   ship: 60,

//   //Risk Loss
//   rto: 20,

//   dto: 15,
//   // customer return
//   crc: 160,

//   //profit
//   profit: 50,
// };

// const result = {};

// let sp = 1;

// const totalFixed = input.productCost + input.package + input.ads + input.ship;

// const rtoNorm = Number(((sp * input.rto) / 100).toFixed(2)); // rto *sp
// const dtoNorm = Number(((input.crc * input.dto) / 100).toFixed(2));

// let sellingPrice = Number(
//   ((input.profit + totalFixed + dtoNorm) / (sp - rtoNorm)).toFixed(2)
// );

// /*
// SP – (220 + 0.20SP + 24) = 50 =>
// SP -0.20SP = 50 +220 + 24
//   selling  = input.profit + totalFixed + dtoNorm/sp - rtoNorm

//  */

// result.productCost = input.productCost;
// result.package = input.package;
// result.ads = input.ads;
// result.ship = input.ship;
// result.totalFixed = totalFixed;
// (result.rtoNorm = rtoNorm), (result.customerReturnCost = input.crc);
// (result.dtoNorm = dtoNorm), (result.sellingPrice = sellingPrice);

// // sp calculation

// console.log("total Fixed : \n\n", result, "\n\n");

///====

/**
 * computeSellingPrice(inputs, options)
 *
 * inputs:
 *  {
 *    productCost,   // e.g. 200
 *    packaging,     // e.g. 25
 *    ads,           // e.g. 40
 *    shipping,      // e.g. 70
 *    overhead,      // e.g. 10
 *    rtoPercent,    // e.g. 15  (as percent)
 *    dtoPercent,    // e.g. 8.5 (as percent of delivered orders)
 *    customerReturnCost, // e.g. 160 (avg return handling cost)
 *    profitPerPaidOrder  // e.g. 60
 *  }
 *
 * options:
 *  { method: 'simple' | 'allocated', roundToNearest: 10 }
 *
 * returns an object with breakdown and suggested prices.
 */

const data = {
  productCost: 200,
  packaging: 25,
  ads: 40,
  shipping: 70,
  overhead: 10,
  rtoPercent: 15,
  dtoPercent: 10,
  rtoRiskCost: 35,
  dtoRiskCost: 160,
  desiredProfit: 60,
};

const sellingPriceCalculator = {};

sellingPriceCalculator.ProductCost = data.productCost;
sellingPriceCalculator.Packaging = data.packaging;
sellingPriceCalculator.Ads = data.ads;
sellingPriceCalculator.Shipping = data.shipping;
sellingPriceCalculator.Overhead = data.overhead;
sellingPriceCalculator.TotalFixedCost =
  data.productCost + data.packaging + data.ads + data.shipping + data.overhead;


/* 
total 100
rtoNumber =  100 - RTO% = result  ==> 85%

dtoNumber =  rtoNumber * DTO%   //  85% * 10% = result ==> 8.5%





*/

let total = 100

sellingPriceCalculator.RTORiskPercent = data.rtoPercent;
sellingPriceCalculator.RTORiskCost = data.rtoRiskCost;

const rtoNorm = Number(
  (100-(total * data.rtoPercent) / 100).toFixed(2)
); 

console.log("rtoNorm",rtoNorm )
const dtoCalcuPer =  Number((rtoNorm*data.dtoPercent/100).toFixed(2))
console.log("dtoCalcuPer", dtoCalcuPer)


sellingPriceCalculator.RTONorm = Number(
  ((data.rtoRiskCost * data.rtoPercent) / 100).toFixed(2)
);


 

sellingPriceCalculator.DTORiskPercent = data.dtoPercent;
sellingPriceCalculator.CustomerReturnCost = data.dtoRiskCost;
sellingPriceCalculator.DTONorm = Number(
  ((data.dtoRiskCost * dtoCalcuPer) / 100).toFixed(2)
);

sellingPriceCalculator.totalRiskCost =
  sellingPriceCalculator.RTONorm + sellingPriceCalculator.DTONorm;

sellingPriceCalculator.desiredProfit = data.desiredProfit;

/* 

Final Selling Price=Fixed Cost Subtotal+Risk Cost Subtotal+Profit Goal\text{Final Selling Price} = \text{Fixed Cost Subtotal} + \text{Risk Cost Subtotal} + \text{Profit Goal} =345+18.85+60=423.85≈₹429–₹439= 345 + 18.85 + 60 = 423.85 \approx. ₹429–₹439


*/


sellingPriceCalculator.FinalSellingPrice = Number(
  (
    sellingPriceCalculator.TotalFixedCost +
    sellingPriceCalculator.totalRiskCost +
    sellingPriceCalculator.desiredProfit
  ).toFixed(2)
);

sellingPriceCalculator.RoundToNearest = 10;

sellingPriceCalculator.SuggestedSellingPrice =
  Math.ceil(
    sellingPriceCalculator.FinalSellingPrice /
      sellingPriceCalculator.RoundToNearest
  ) * sellingPriceCalculator.RoundToNearest;

console.log("Selling_Price_Calculator", "\n\n", sellingPriceCalculator, "\n\n");
 