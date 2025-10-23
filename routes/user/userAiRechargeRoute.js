const express = require("express");
const { authentication } = require("../../middi/userAuth");
const {
  createRecharge,
  getAllAiRechargeDataUser,
  verifyRechargePayment,
  rechargeHistory,
  getWalletData,
} = require("../../controllers/user/userWalletRechargeCtrl");

const router = express.Router();

router.route("/recharge/getAll").get(authentication, getAllAiRechargeDataUser);

router
  .route("/recharge/create/:rechargeId")
  .post(authentication, createRecharge);

router.route("/recharge/verify").post(authentication, verifyRechargePayment);

router.route("/recharge/history").get(authentication, rechargeHistory);

router.route("/recharge/wallet").get(authentication, getWalletData);

module.exports = router;

/* 


_*base + /user/ai*_    *static*

 get all recharge plan  *get*

/recharge/getAll      

 create Payment *Post*

/recharge/create/:rechargeId


 verify Payment *Post*

/recharge/verify

 recharge history *Get*   

/recharge/history

 get wallet  *Get*

/recharge/wallet

*/
