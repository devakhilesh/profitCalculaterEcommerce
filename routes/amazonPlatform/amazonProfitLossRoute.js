const express = require("express");

const {
  authentication,
  checkSubscriptionMiddi,
} = require("../../middi/userAuth");
const {
  createAmazonProfitLossCalc,
  updateAmazonProfitLossCalc,
  getAllAmazonProfitLossCalc,
  getAmazonProfitLossCalcById,
  deleteAmazonProfitLossCalc,
} = require("../../controllers/amazon/profitLossCalcCtrl");

const router = express.Router();

router
  .route("/create/:platformId")
  .post(authentication, checkSubscriptionMiddi, createAmazonProfitLossCalc);

router
  .route("/update/:ProfitLossCalcId")
  .put(authentication, checkSubscriptionMiddi, updateAmazonProfitLossCalc);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllAmazonProfitLossCalc);

router.route("/get/:id").get(authentication, getAmazonProfitLossCalcById);

router.route("/delete/:id").delete(authentication, deleteAmazonProfitLossCalc);

module.exports = router;
