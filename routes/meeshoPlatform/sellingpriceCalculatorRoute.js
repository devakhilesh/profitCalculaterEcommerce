const express = require("express");

const { authentication } = require("../../middi/userAuth");
const {
  createSellingPriceCalc,
  updateSellingPriceCalc,
  getAllSellingPriceCalc,
  deleteSellingPriceCalc
} = require("../../controllers/meesho/sellingPriceCalculator");

const router = express.Router();

router.route("/create/:platformId").post(authentication, createSellingPriceCalc);

router
  .route("/update/:sellingPriceCalcId")
  .put(authentication, updateSellingPriceCalc);

router.route("/getAll/:platformId").get(authentication, getAllSellingPriceCalc);

router.route("/delete/:id").delete(authentication, deleteSellingPriceCalc);

module.exports = router;
