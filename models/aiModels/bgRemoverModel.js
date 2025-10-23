/*        original_public_id: result.public_id,
        original_url: result.secure_url,
        bg_removed_public_id: bgRemovedPublicId,
        bg_removed_url: bgRemovedUrl, */

const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const aiBackgroundRemoverSchema = new mongoose.Schema(
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

    bg_removed_img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BackgroundRemoverModel = mongoose.model(
  "Ai_Background_Remover",
  aiBackgroundRemoverSchema
);

module.exports = BackgroundRemoverModel;
