const data = {
  // Return expense
  dispatch: 100,
  RTO_percent: 15,
  //   15,
  DTO_percent: 15,
  meesho_return_charge: 175,
  // ads
  ads_withGst: 590,
  // wrong damage
  wrong_damage_percent: 5,
  //packaging expense
  perOrderPckExpense: 5, // in amount
  //Shipping Gst
  shipping_Gst_per_order: 13,

  costPrice: 150,

  // profit
  profit: 20,
};

//===================================== Return Expense  ===========================
//
let dis = data.dispatch;
let rtoPer = data.RTO_percent;
let dtoPer = data.DTO_percent;
let mRC = data.meesho_return_charge;

const retExp = {};

retExp.totalDispatchOrder = dis;
retExp.rtoPer = rtoPer;
retExp.rtoNorm = Math.round(Number(((dis * rtoPer) / 100).toFixed(2)));

const totalDelivered = dis - retExp.rtoNorm; // total delivered order

retExp.totalDelivered = totalDelivered;
retExp.dtoPer = dtoPer;
retExp.dtoNorm = Math.round(
  Number(((totalDelivered * dtoPer) / 100).toFixed(2))
);
const ordersToBePaid = Number(
  (dis - retExp.rtoNorm - retExp.dtoNorm).toFixed(2)
); // order to be paid
retExp.ordersToBePaid = ordersToBePaid;
retExp.messhoReturnCost = mRC;
retExp.totalReturnAmount = Number((retExp.dtoNorm * mRC).toFixed(2));
const return_Exp_per_Order = Number(
  (retExp.totalReturnAmount / retExp.ordersToBePaid).toFixed(2)
);
retExp.return_Exp_per_Order = return_Exp_per_Order;

console.log("messho Return Expense:\n\n", retExp, "\n\n");

//======================== Advertisement ======================

const adsExp = {};

adsExp.ordersToBePaid = ordersToBePaid;
adsExp.ads_withGst = data.ads_withGst;
const perOrderAdsExp = Number((data.ads_withGst / ordersToBePaid).toFixed(2));

adsExp.perOrderAdsExp = perOrderAdsExp;

console.log("Advertisement_Expense:\n\n", adsExp, "\n\n");

// =============== wrong Damage ================

const wrongDamage = {};

wrongDamage.totalDispatchOrder = dis;
wrongDamage.wrong_damage_percent = data.wrong_damage_percent;
wrongDamage.wrong_damage_Norm = Number(
  ((dis * wrongDamage.wrong_damage_percent) / 100).toFixed(2)
);
const perOrderWrongDamageAmount = Number(
  ((wrongDamage.wrong_damage_Norm * data.costPrice) / ordersToBePaid).toFixed(2)
);
wrongDamage.perOrderWrongDamageAmount = perOrderWrongDamageAmount;

console.log("Wrong product Calculation :\n\n", wrongDamage, "\n\n");

// ======================= Packaging Expense =====

const pckExp = {};

pckExp.perOrderPckExpense = data.perOrderPckExpense;

const totalPckExpense = Number((dis * data.perOrderPckExpense).toFixed(2));

pckExp.totalPckExpense = totalPckExpense;

const perOrderToBePaidPckExp = Number(
  (pckExp.totalPckExpense / ordersToBePaid).toFixed(2)
);

pckExp.perOrderToBePaidPckExp = perOrderToBePaidPckExp;

console.log("Packaging calculation: \n\n", pckExp, "\n\n");

//===========================  Other Details================== //

const finalCalculation = {};

finalCalculation.purchaseWithGst = data.costPrice;

finalCalculation.pckExpense = perOrderToBePaidPckExp;

finalCalculation.returnCharge = return_Exp_per_Order;

finalCalculation.adsExpense = perOrderAdsExp;

finalCalculation.shipping_Gst_per_order = data.shipping_Gst_per_order;

finalCalculation.wrongDamage = perOrderWrongDamageAmount;

const totalCost = Number(
  (
    data.costPrice +
    perOrderToBePaidPckExp +
    return_Exp_per_Order +
    perOrderAdsExp +
    data.shipping_Gst_per_order +
    perOrderWrongDamageAmount
  ).toFixed(2)
);

finalCalculation.totalCost = totalCost;

finalCalculation.profit = data.profit;

// toGetDesiredProfitOnTotalDispatchedOrderFormulaToRecoverThisProfitInPaidOrders

const desiredProfitDistributionOnPaidOrders = Number(
  ((dis * data.profit) / ordersToBePaid).toFixed(2)
);
finalCalculation.desiredProfitDistributionOnPaidOrders =
  desiredProfitDistributionOnPaidOrders;

finalCalculation.messhoPrice = Number(
  (totalCost + desiredProfitDistributionOnPaidOrders).toFixed(2)
);

console.log(
  "final calculation selling Price calculation: \n\n",
  finalCalculation,
  "\n\n"
);

// safe version of your script that avoids NaN / Infinity
/* 
const data = {
  // Return expense
  dispatch: 1,
  RTO_percent: 100,
  DTO_percent: 0,
  meesho_return_charge: 175,
  // ads
  ads_withGst: 590,
  // wrong damage
  wrong_damage_percent: 0,
  //packaging expense
  perOrderPckExpense: 5, // in amount
  //Shipping Gst
  shipping_Gst_per_order: 13,

  costPrice: 150,

  // profit
  profit: 20,
};

// fallback (change to null if preferred)
const FALLBACK = 0;

// helper: safe divide with rounding to 2 decimals, returns fallback when denominator is 0 or not finite
function safeDivide(numerator, denominator, fallback = FALLBACK) {
  const num = Number(numerator);
  const den = Number(denominator);

  if (!Number.isFinite(num) || !Number.isFinite(den)) return fallback;
  if (den === 0) {
    return fallback;
  }
  return Number((num / den).toFixed(2));
}

// helper: safe number normalize (round or fallback)
function safeNumber(v, fallback = FALLBACK) {
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : fallback;
}

//===================================== Return Expense  ===========================
let dis = safeNumber(data.dispatch, 0);
let rtoPer = safeNumber(data.RTO_percent, 0);
let dtoPer = safeNumber(data.DTO_percent, 0);
let mRC = safeNumber(data.meesho_return_charge, 0);

const retExp = {};

retExp.totalDispatchOrder = dis;
retExp.rtoPer = rtoPer;
retExp.rtoNorm = Math.round(Number(((dis * rtoPer) / 100).toFixed(2)));

const totalDelivered = dis - retExp.rtoNorm; // total delivered order
retExp.totalDelivered = totalDelivered;
retExp.dtoPer = dtoPer;
retExp.dtoNorm = Math.round(
  Number(((totalDelivered * dtoPer) / 100).toFixed(2))
);

const ordersToBePaid = safeNumber(dis - retExp.rtoNorm - retExp.dtoNorm, 0); // guard here
retExp.ordersToBePaid = ordersToBePaid;
retExp.messhoReturnCost = mRC;
retExp.totalReturnAmount = safeNumber(retExp.dtoNorm * mRC, 0);

// return_Exp_per_Order = totalReturnAmount / ordersToBePaid (safe)
retExp.return_Exp_per_Order = safeDivide(
  retExp.totalReturnAmount,
  ordersToBePaid
);

// ensure numeric finite values (avoid -0)
for (const k of Object.keys(retExp)) {
  if (!Number.isFinite(retExp[k])) retExp[k] = FALLBACK;
}

console.log("messho Return Expense:\n\n", retExp, "\n\n");

//======================== Advertisement ======================
const adsExp = {};

adsExp.ordersToBePaid = ordersToBePaid;
adsExp.ads_withGst = safeNumber(data.ads_withGst, 0);

// perOrderAdsExp = ads_withGst / ordersToBePaid (safe)
adsExp.perOrderAdsExp = safeDivide(adsExp.ads_withGst, ordersToBePaid);

console.log("Advertisement_Expense:\n\n", adsExp, "\n\n");

// =============== wrong Damage ================

const wrongDamage = {};

wrongDamage.totalDispatchOrder = dis;
wrongDamage.wrong_damage_percent = safeNumber(data.wrong_damage_percent, 0);
wrongDamage.wrong_damage_Norm = Number(
  ((dis * wrongDamage.wrong_damage_percent) / 100).toFixed(2)
);

// perOrderWrongDamageAmount = (wrong_damage_Norm * costPrice) / ordersToBePaid (safe)
wrongDamage.perOrderWrongDamageAmount = safeDivide(
  wrongDamage.wrong_damage_Norm * safeNumber(data.costPrice, 0),
  ordersToBePaid
);

// guard numeric fields
for (const k of Object.keys(wrongDamage)) {
  if (!Number.isFinite(wrongDamage[k])) wrongDamage[k] = FALLBACK;
}

console.log("Wrong product Calculation :\n\n", wrongDamage, "\n\n");

// ======================= Packaging Expense =====
const pckExp = {};

pckExp.perOrderPckExpense = safeNumber(data.perOrderPckExpense, 0);

const totalPckExpense = safeNumber(dis * data.perOrderPckExpense, 0);
pckExp.totalPckExpense = totalPckExpense;

// perOrderToBePaidPckExp = totalPckExpense / ordersToBePaid (safe)
pckExp.perOrderToBePaidPckExp = safeDivide(totalPckExpense, ordersToBePaid);

// guard numeric fields
for (const k of Object.keys(pckExp)) {
  if (!Number.isFinite(pckExp[k])) pckExp[k] = FALLBACK;
}

console.log("Packaging calculation: \n\n", pckExp, "\n\n");

//===========================  Other Details================== //
const finalCalculation = {};

finalCalculation.purchaseWithGst = safeNumber(data.costPrice, 0);

finalCalculation.pckExpense = pckExp.perOrderToBePaidPckExp;

finalCalculation.returnCharge = retExp.return_Exp_per_Order;

finalCalculation.adsExpense = adsExp.perOrderAdsExp;

finalCalculation.shipping_Gst_per_order = safeNumber(
  data.shipping_Gst_per_order,
  0
);

finalCalculation.wrongDamage = wrongDamage.perOrderWrongDamageAmount;

const totalCost = safeNumber(
  data.costPrice +
    pckExp.perOrderToBePaidPckExp +
    retExp.return_Exp_per_Order +
    adsExp.perOrderAdsExp +
    data.shipping_Gst_per_order +
    wrongDamage.perOrderWrongDamageAmount,
  FALLBACK
);

finalCalculation.totalCost = totalCost;

finalCalculation.profit = safeNumber(data.profit, 0);

// desiredProfitDistributionOnPaidOrders = (dis * profit) / ordersToBePaid (safe)
finalCalculation.desiredProfitDistributionOnPaidOrders = safeDivide(
  dis * finalCalculation.profit,
  ordersToBePaid
);

// messhoPrice = totalCost + desiredProfitDistributionOnPaidOrders (safe)
finalCalculation.messhoPrice = safeNumber(
  finalCalculation.totalCost +
    finalCalculation.desiredProfitDistributionOnPaidOrders,
  FALLBACK
);

// final guard
for (const k of Object.keys(finalCalculation)) {
  if (!Number.isFinite(finalCalculation[k])) finalCalculation[k] = FALLBACK;
}

console.log(
  "final calculation selling Price calculation: \n\n",
  finalCalculation,
  "\n\n"
);
 */
