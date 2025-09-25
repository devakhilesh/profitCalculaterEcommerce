const express = require("express");
const {
  createProfitHistory,
  updateProfitHistory,
  getAllProfitHistory,
  deleteProfitHistory,
  createSellingHistory,
  updateSellingHistory,
  getAllSellingHistory,
  deleteSellingHistory,
} = require("../controllers/profitLossSPCPCtrl");
const { authentication } = require("../middi/userAuth");

const router = express.Router();

router.route("/create/profit-history/:platformId").post(authentication,createProfitHistory);

router.route("/update/ProfitHistory").put(authentication,updateProfitHistory);

router.route("/getAll/ProfitHistory").get(authentication, getAllProfitHistory);

router
  .route("/delete/ProfitHistory")
  .delete(authentication, deleteProfitHistory);
 

  // selling Price calculator 

router.route("/create/sellingCalcHistory/:platformId").post(authentication,createSellingHistory);

router.route("/update/sellingCalcHistory/:sellingHistoryId").put(authentication,updateSellingHistory);

router.route("/getAll/sellingCalcHistory/:platformId").get(authentication, getAllSellingHistory);

router
  .route("/delete/sellingCalcHistory/:id")
  .delete(authentication, deleteSellingHistory);


module.exports = router;
