const express = require("express");

const routes = express();

const authRoute = require("../routes/authRoute");

const PlatformRoute = require("../routes/platformRoute");

const sellingPriceOnRevenueCalcRoute = require("../routes/sellingOnRevenueCalcRoute");

routes.use("/auth", authRoute);

routes.use("/platForm", PlatformRoute);

routes.use("/user/sellingCalcHistory", sellingPriceOnRevenueCalcRoute);

module.exports = routes;
