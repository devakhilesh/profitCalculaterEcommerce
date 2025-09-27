const mongoose = require("mongoose");

const adminAuthSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

const userAuthModel = mongoose.model("userAuth", adminAuthSchema);

module.exports = userAuthModel;
