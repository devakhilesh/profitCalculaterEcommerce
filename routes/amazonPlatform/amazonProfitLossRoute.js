const express = require("express");

const { authentication } = require("../../middi/userAuth");
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
  .post(authentication, createAmazonProfitLossCalc);

router
  .route("/update/:profitLossCalcId")
  .put(authentication, updateAmazonProfitLossCalc);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllAmazonProfitLossCalc);

router.route("/get/:id").get(authentication, getAmazonProfitLossCalcById);

router.route("/delete/:id").delete(authentication, deleteAmazonProfitLossCalc);

module.exports = router;
