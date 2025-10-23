const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const aiImageEnhancerSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    featureType: {
      type: String,
      default: "Image Enhancer",
    },

    enhanced_img: {
      public_id: {
        type: String,
        required: true,
      },

      url: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const ImageEnhancerModel = mongoose.model(
  "Ai_Image_Enhancer_Model",
  aiImageEnhancerSchema
);

module.exports = ImageEnhancerModel