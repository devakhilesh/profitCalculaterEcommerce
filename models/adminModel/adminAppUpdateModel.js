const mongoose = require("mongoose");

const AppVersionSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["android", "ios"],
      default: "android",
      index: true,
    },

    latestVersion: {
      type: String,
      required: true,
    },

    downloadLink: {
      type: String,
      required: true,
    },

    disclaimer: {
      type: String,
    },
  },
  { timestamps: true }
);

const appUpdateModel = mongoose.model("AppUpdateModel", AppVersionSchema);

module.exports = appUpdateModel