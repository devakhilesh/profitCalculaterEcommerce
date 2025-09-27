const express = require("express");

const { authentication } = require("../middi/userAuth");
const {
  createSellingHistory,
  updateSellingHistory,
  getAllSellingHistory,
  deleteSellingHistory,
} = require("../controllers/sellingPriceOnRevenueCalcCtrl");

const router = express.Router();


// selling Price calculator
/* 
router
  .route("/create/sellingCalcHistory/:platformId")
  .post(authentication, createSellingHistory);

router
  .route("/update/sellingCalcHistory/:sellingHistoryId")
  .put(authentication, updateSellingHistory);

router
  .route("/getAll/sellingCalcHistory/:platformId")
  .get(authentication, getAllSellingHistory);

router
  .route("/delete/sellingCalcHistory/:id")
  .delete(authentication, deleteSellingHistory);

 */

  
  
  
  router
  .route("/create/:platformId")
  .post(authentication, createSellingHistory);

router
  .route("/update/:sellingHistoryId")
  .put(authentication, updateSellingHistory);

router
  .route("/getAll/:platformId")
  .get(authentication, getAllSellingHistory);

router
  .route("/delete/:id")
  .delete(authentication, deleteSellingHistory);

  
  
 

module.exports = router;
