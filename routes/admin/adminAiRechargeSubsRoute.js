const express = require("express");
const { authentication, adminAuthorization } = require("../../middi/userAuth");
const {
  createAIRecharge,
  getAllAiRechargeData,
  updateRechargeData,
  deleteRechargeData,
} = require("../../controllers/admin/aiRechargeSubscriptionCtrl");

const router = express.Router();

router
  .route("/create")
  .post(authentication, adminAuthorization, createAIRecharge);
router
  .route("/getAll")
  .get(authentication, adminAuthorization, getAllAiRechargeData);

router
  .route("/update/:aiRechargeId")
  .put(authentication, adminAuthorization, updateRechargeData);

router
  .route("/delete/:aiRechargeId")
  .delete(authentication, adminAuthorization, deleteRechargeData);

module.exports = router;



/* 
base+/admin/aiRecharge/create  method post 

base+/admin/aiRecharge/update/aiRechargeId  method put 

base+/admin/aiRecharge/delete/aiRechargeId  method delete 

base+/admin/aiRecharge/getAll  method get 

*/
