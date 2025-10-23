const express = require("express");

const routes = express();

const authRoute = require("../routes/user/authRoute");

const PlatformRoute = require("../routes/admin/platformRoute");

const sellingPriceOnRevenueCalcRoute = require("../routes/meeshoPlatform/sellingOnRevenueCalcRoute");

const sellingPriceNormalCalcRoute = require("../routes/meeshoPlatform/sellingpriceCalculatorRoute");

// amazon Platform

const amazonSellingPriceHelperRoute = require("../routes/amazonPlatform/amazonSellingPriceHelperRoute");

const amazonSellingprice = require("../routes/amazonPlatform/amazonSellingPriceRoute");

const amazonProfitLossCalcRoute = require("../routes/amazonPlatform/amazonProfitLossRoute");

const amazonRevenueCalcRoute = require("../routes/amazonPlatform/amazonRevenueRoute");

const bgRemoverRoute = require("../routes/user/bgRemoverRoute");

const bgReplacerRoute = require("../routes/user/bgChangerRoute");

const imgToimgEnhancedRoute = require("../routes/user/imgEnhenceRoute");

const imgToimgVariation = require("../routes/user/imageVariationRoute");

// subscription

const userSbscriptionRoute = require("../routes/user/userSubscribeRoute");

const userAppUpdateRoute = require("../routes/user/checkAppUpdateRoute");

// ai recharge 

const userAiRechargeRoute = require("../routes/user/userAiRechargeRoute")

//======================================= routing =======

routes.use("/auth", authRoute);

routes.use("/platForm", PlatformRoute);

routes.use("/user/sellingCalcHistory", sellingPriceOnRevenueCalcRoute);

routes.use("/user/sellingNormalCalc", sellingPriceNormalCalcRoute);

routes.use("/user/bgRemover", bgRemoverRoute);

routes.use("/user/bgReplacement", bgReplacerRoute);

routes.use("/user/enhanced", imgToimgEnhancedRoute);

routes.use("/user", imgToimgVariation);

routes.use("/amazon/helper", amazonSellingPriceHelperRoute);

routes.use("/user/amazon/sellingPrice", amazonSellingprice);

routes.use("/user/amazon/profitLossCalc", amazonProfitLossCalcRoute);

routes.use("/user/amazon/revenue", amazonRevenueCalcRoute);

routes.use("/user/subscription", userSbscriptionRoute);

routes.use("/app/update", userAppUpdateRoute);

routes.use("/user/ai", userAiRechargeRoute);

module.exports = routes;
