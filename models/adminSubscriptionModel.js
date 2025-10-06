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
