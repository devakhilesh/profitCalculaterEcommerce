const express = require("express");

const { authentication, checkSubscriptionMiddi } = require("../../middi/userAuth");
const {
  createAmazonSellingPriceCalc,
  updateAmazonSellingPriceCalc,
  getAllAmazonSellingPriceCalc,
  getAmazonSellingPriceCalcById,
  deleteAmazonSellingPriceCalc,
} = require("../../controllers/amazon/sellingPriceCalculatorCtrl");

const router = express.Router();

router
  .route("/create/:platformId")
  .post(authentication,checkSubscriptionMiddi, createAmazonSellingPriceCalc);

router
  .route("/update/:sellingPriceCalcId")
  .put(authentication,checkSubscriptionMiddi, updateAmazonSellingPriceCalc);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllAmazonSellingPriceCalc);

router.route("/get/:id").get(authentication, getAmazonSellingPriceCalcById);

router
  .route("/delete/:id")
  .delete(authentication, deleteAmazonSellingPriceCalc);

module.exports = router;
