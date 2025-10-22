const express = require("express");

const { authentication, checkSubscriptionMiddi } = require("../../middi/userAuth");
const {
  createSellingHistory,
  updateSellingHistory,
  getAllSellingHistory,
  deleteSellingHistory,
  getSellingHistoryById,
} = require("../../controllers/meesho/sellingPriceOnRevenueCalcCtrl");

const router = express.Router();

router.route("/create/:platformId").post(authentication,checkSubscriptionMiddi, createSellingHistory);

router
  .route("/update/:sellingHistoryId")
  .put(authentication,checkSubscriptionMiddi, updateSellingHistory);

router.route("/getAll/:platformId").get(authentication, getAllSellingHistory);

router.route("/get/:id").get(authentication, getSellingHistoryById);

router.route("/delete/:id").delete(authentication, deleteSellingHistory);

module.exports = router;
