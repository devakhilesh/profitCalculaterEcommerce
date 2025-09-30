const express = require("express");

const routes = express();

const authRoute = require("../routes/authRoute");

const PlatformRoute = require("../routes/platformRoute");

const sellingPriceOnRevenueCalcRoute = require("../routes/meeshoPlatform/sellingOnRevenueCalcRoute");

const sellingPriceNormalCalcRoute = require("../routes/meeshoPlatform/sellingpriceCalculatorRoute");

// amazon Platform

const amazonSellingPriceHelperRoute = require("../routes/amazonPlatform/amazonSellingPriceHelperRoute");


const bgRemoverRoute = require("../routes/bgRemoverRoute");

routes.use("/auth", authRoute);

routes.use("/platForm", PlatformRoute);

routes.use("/user/sellingCalcHistory", sellingPriceOnRevenueCalcRoute);

routes.use("/user/sellingNormalCalc", sellingPriceNormalCalcRoute);

routes.use("/user/bgRemover", bgRemoverRoute);


routes.use("/amazon/helper", amazonSellingPriceHelperRoute);


module.exports = routes;
