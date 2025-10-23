const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const userAiRechargeHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
    },

    aiRechargeId: {
      type: ObjectId,
      required: true,
      ref: "AI_Recharge_Credit_Model",
    },

    paidAmount: {
      type: Number,
      required: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      razorpay_paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending",
      },
    },

    isPaymentVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const useAiRechargeHistoryModel = mongoose.model(
  "user_AI_Recharge_History",
  userAiRechargeHistorySchema
);

module.exports = useAiRechargeHistoryModel;
