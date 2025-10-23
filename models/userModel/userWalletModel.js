const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const userRechargeSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
    },

    credit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const userAIWalletModel = mongoose.model("userAi_wallet", userRechargeSchema);

module.exports = userAIWalletModel;
