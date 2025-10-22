const express = require("express");

const { authentication, checkSubscriptionMiddi } = require("../../middi/userAuth");
const {
  createAmazonRevenueCalc,
  updateAmazonRevenueCalc,
  getAllAmazonRevenueCalc,
  getAmazonRevenueCalcById,
  deleteAmazonRevenuePriceCalc,
} = require("../../controllers/amazon/revenueCalcCtrl");

const router = express.Router();

router
  .route("/create/:platformId")
  .post(authentication,checkSubscriptionMiddi, createAmazonRevenueCalc);

router
  .route("/update/:revenueCalcId")
  .put(authentication,checkSubscriptionMiddi, updateAmazonRevenueCalc);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllAmazonRevenueCalc);

router.route("/get/:id").get(authentication, getAmazonRevenueCalcById);

router
  .route("/delete/:id")
  .delete(authentication, deleteAmazonRevenuePriceCalc);

module.exports = router;
