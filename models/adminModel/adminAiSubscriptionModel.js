const mongoose = require("mongoose");

const aiSubscriptionRechargeSchema = new mongoose.Schema({
  rechargeName: {
    type: String,
    required: true,
  },

  rechargeAmount: {
    type: Number,
    required: true,
  },

  discountPercent: {
    type: Number,
    default: 0,
  },

  creditBalance: {
    type: Number,
    requird: true,
  },

  active: {
    type: Boolean,
    default: true,
  },
},{timestamps:true});

const AIRechageModel = mongoose.model("AI_Recharge_Credit_Model",aiSubscriptionRechargeSchema)

module.exports = AIRechageModel