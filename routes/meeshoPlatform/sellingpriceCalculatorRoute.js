const express = require("express");

const { authentication, checkSubscriptionMiddi } = require("../../middi/userAuth");
const {
  createSellingPriceCalc,
  updateSellingPriceCalc,
  getAllSellingPriceCalc,
  deleteSellingPriceCalc,
  getSellingPriceCalcById
} = require("../../controllers/meesho/sellingPriceCalculator");

const router = express.Router();

router.route("/create/:platformId").post(authentication,checkSubscriptionMiddi, createSellingPriceCalc);

router
  .route("/update/:sellingPriceCalcId")
  .put(authentication,checkSubscriptionMiddi, updateSellingPriceCalc);

router.route("/getAll/:platformId").get(authentication, getAllSellingPriceCalc);

router.route("/get/:id").get(authentication, getSellingPriceCalcById);


router.route("/delete/:id").delete(authentication, deleteSellingPriceCalc);

module.exports = router;
