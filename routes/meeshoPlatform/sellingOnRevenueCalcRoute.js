const express = require("express");

const { authentication } = require("../../middi/userAuth");
const {
  createSellingHistory,
  updateSellingHistory,
  getAllSellingHistory,
  deleteSellingHistory,
} = require("../../controllers/meesho/sellingPriceOnRevenueCalcCtrl");

const router = express.Router();

router.route("/create/:platformId").post(authentication, createSellingHistory);

router
  .route("/update/:sellingHistoryId")
  .put(authentication, updateSellingHistory);

router.route("/getAll/:platformId").get(authentication, getAllSellingHistory);

router.route("/delete/:id").delete(authentication, deleteSellingHistory);

module.exports = router;
