const express = require("express");
const { authentication, userAuthorization } = require("../middi/userAuth");
const {
  getAllSubscription,
  getAllSubscriptionUser,
} = require("../controllers/admin/adminSubscriptionController");
const {
  createPaymentOrder,
  getSingleSubscriptionHistory,
  getAllSubscriptionHistory,
  checkSubscription,
  getRazorpayPublicKey,
  verifyPayment,
} = require("../controllers/user/userSubscribedCtrl");

const router = express.Router();

router.route("/plans/getAll").get(getAllSubscriptionUser);

router
  .route("/payment/create/:subscriptionId")
  .post(authentication, userAuthorization, createPaymentOrder);

router
  .route("/payment/verify")
  .post(authentication, userAuthorization, verifyPayment);

router
  .route("/payment/getAll")
  .get(authentication, userAuthorization, getAllSubscriptionHistory);

router
  .route("/payment/get/:paymentId")
  .get(authentication, userAuthorization, getSingleSubscriptionHistory);

router
  .route("/payment/check")
  .get(authentication, userAuthorization, checkSubscription);

router
  .route("/payment/publicKey")
  .get(authentication, userAuthorization, getRazorpayPublicKey);

module.exports = router;

/* 
baseUrl + /user/subscription +

*Get All Pricing Plans*
*method:Get*

/plans/getAll 

*create payment order*
*method:Post*

/payment/create/:subscriptionId


*create payment verification*
*method:Post*

_*Body*_:razorpay_order_id,razorpay_payment_id,razorpay_signature,paymentId,

/payment/verify




*get All payment order*
*method:Get*

/payment/getAll



*get Single payment order*
*method:Get*

/payment/get/:paymentId


* payment order check*
*method:Get*

/payment/check

* payment public key razorpay*
*method:Get*

payment/publicKey

*/
