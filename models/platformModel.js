const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
    },
    defaultGstPercent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "comming soon"],
      default: "comming soon",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Platform", platformSchema);

/* 
"name":"Messho"
"country":"India"
"defaultGstPercent": "0",
"status": "active",
"notes": "filhaaal kuc nhi"
*/
