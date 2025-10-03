const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const aiBackgroundChangerSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    original_img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    replaced_img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    
    prompt: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BgChangerModel = mongoose.model(
  "AI_Background_Changer",
  aiBackgroundChangerSchema
);

module.exports = BgChangerModel;
