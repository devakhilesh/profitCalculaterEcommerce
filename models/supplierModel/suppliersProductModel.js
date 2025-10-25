const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const supplierProductSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
    },

    supplier: {
      type: ObjectId,
      required: true,
      ref: "Supplier_Details_Model",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    priceRange: {
      type: String,
      required: true,
      trim: true, //"₹100 - ₹150" or "10 - 15 USD"
    },

    moq: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      enum: [
        "pcs",
        "kg",
        "gram",
        "ltr",
        "ml",
        "meter",
        "cm",
        "mm",
        "dozen",
        "box",
        "packet",
        "pair",
        "set",
        "bundle",
        "roll",
        "sheet",
        "unit",
        "piece",
        "bag",
        "bottle",
        "can",
      ],
      default: "pcs",
    },

    image: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    brandName: {
      type: String,
      trim: true,
      default: "",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const SupplierProductModel = mongoose.model(
  "Supplier_Product_Model",
  supplierProductSchema
);

module.exports = SupplierProductModel;
