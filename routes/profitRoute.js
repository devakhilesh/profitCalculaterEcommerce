const express = require("express");
const {
  createProfitHistory,
  updateProfitHistory,
  getAllProfitHistory,
  deleteProfitHistory,
} = require("../controllers/profitLossSPCPCtrl");
const { authentication } = require("../middi/userAuth");

const router = express.Router();

router.route("/create/profit-history/:platformId").post(createProfitHistory);

router.route("/update/ProfitHistory").put(updateProfitHistory);

router.route("/getAll/ProfitHistory").get(authentication, getAllProfitHistory);

router
  .route("/delete/ProfitHistory")
  .delete(authentication, deleteProfitHistory);

module.exports = router;
