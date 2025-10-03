const express = require("express");

const routes = express();

const authRoute = require("../routes/authRoute");

const PlatformRoute = require("../routes/platformRoute");

const sellingPriceOnRevenueCalcRoute = require("../routes/meeshoPlatform/sellingOnRevenueCalcRoute");

const sellingPriceNormalCalcRoute = require("../routes/meeshoPlatform/sellingpriceCalculatorRoute");

// amazon Platform

const amazonSellingPriceHelperRoute = require("../routes/amazonPlatform/amazonSellingPriceHelperRoute");

const amazonSellingprice = require("../routes/amazonPlatform/amazonSellingPriceRoute");

const amazonProfitLossCalcModel = require("../routes/amazonPlatform/amazonProfitLossRoute");

const bgRemoverRoute = require("../routes/bgRemoverRoute");

const bgReplacerRoute = require("../routes/bgChangerRoute");

routes.use("/auth", authRoute);

routes.use("/platForm", PlatformRoute);

routes.use("/user/sellingCalcHistory", sellingPriceOnRevenueCalcRoute);

routes.use("/user/sellingNormalCalc", sellingPriceNormalCalcRoute);

routes.use("/user/bgRemover", bgRemoverRoute);

routes.use("/user/bgReplacement", bgReplacerRoute);

routes.use("/amazon/helper", amazonSellingPriceHelperRoute);

routes.use("/user/amazon/sellingPrice", amazonSellingprice);

routes.use("/user/amazon/profitLossCalc", amazonProfitLossCalcModel);

module.exports = routes;
