
const data = {
    // Return expense
  dispatch: 100,
  RTO_percent: 15, 
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
retExp.rtoNorm = Number(((dis * rtoPer) / 100).toFixed(2)); 

const totalDelivered = dis - retExp.rtoNorm; // total delivered order

retExp.totalDelivered = totalDelivered;
retExp.dtoPer = dtoPer;
retExp.dtoNorm = Number(((totalDelivered * dtoPer) / 100).toFixed(2));
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
