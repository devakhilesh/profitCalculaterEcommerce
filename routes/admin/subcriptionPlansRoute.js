const express = require("express");
const { authentication, adminAuthorization } = require("../../middi/userAuth");
const {
  createSubscription,
  updateSubscription,
  getAllSubscription,
  deleteSubscription,
} = require("../../controllers/admin/adminSubscriptionController");

const router = express.Router();

/* 

BaseUrl + /admin/subscription


*/

router
  .route("/create")
  .post(authentication, adminAuthorization, createSubscription);

router
  .route("/update/:subscriptionId")
  .put(authentication, adminAuthorization, updateSubscription);

router
  .route("/getAll")
  .get(authentication, adminAuthorization, getAllSubscription);

router
  .route("/delete/:subscriptionId")
  .delete(authentication, adminAuthorization, deleteSubscription);

module.exports = router;

/* 

Schema

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionName: {
      type: String,
      required: true,
    },

    subscriptionType: {
      type: String,
      enum: ["Weekly", "Monthly", "Yearly"],
      required: true,
    },

    mrpSubscription: {    // 799   discount 50%  349
      type: Number,
      required: true,
    },

    discountPercent: {
      type: Number,
      default: 0,
    },

    validUpTo: {
      type: Number,
      required: true,
    },

    subscriptionNote: {
      type: String,
    },

    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const SubscriptionModel = mongoose.model(
  "SubscriptionModel",
  subscriptionSchema
);

module.exports = SubscriptionModel;


*/
