const express = require("express");

const { authentication } = require("../../middi/userAuth");
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
  .post(authentication, createAmazonSellingPriceCalc);

router
  .route("/update/:sellingPriceCalcId")
  .put(authentication, updateAmazonSellingPriceCalc);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllAmazonSellingPriceCalc);

router.route("/get/:id").get(authentication, getAmazonSellingPriceCalcById);

router
  .route("/delete/:id")
  .delete(authentication, deleteAmazonSellingPriceCalc);

module.exports = router;
