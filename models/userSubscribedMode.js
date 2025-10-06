const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSubscribedSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
      index: true,
    },

    subscriptionId: {
      type: ObjectId,
      required: true,
      ref: "SubscriptionModel",
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
    // subscribed form
    subscribedDateTime: {
      type: Date,
    },
    // subscription expairy date
    expairySubsDateTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const userSubscribedModel = mongoose.model(
  "userSubscribed",
  userSubscribedSchema
);

module.exports = userSubscribedModel;

/* 
        const nowUTC = new Date();
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

        campaign.startDate = nowIST;

        const numberOfCampDay = campaign.campDay || 1;
        const endDate = new Date(nowIST);
        endDate.setDate(endDate.getDate() + numberOfCampDay);
        campaign.endDate = endDate;

*/
