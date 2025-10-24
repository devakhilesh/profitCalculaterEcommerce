const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId

const supplierDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
    },

    // unique
    storeName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SupplierDetailsModel = mongoose.model(
  "Supplier_Details_Model",
  supplierDetailsSchema
);

module.exports = SupplierDetailsModel;
