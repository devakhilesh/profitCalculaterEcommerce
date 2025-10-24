const SupplierDetailsModel = require("../../models/supplierModel/supplierDetailsModel");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// suppliers create

exports.createSupplierDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ status: false, message: "Auth Required" });
    }

    const userId = req.user._id;
    const data = req.body || {};

    const storeNameRaw = data.storeName;
    const phoneRaw = data.phone;
    const addressRaw = data.address;

    if (!storeNameRaw || typeof storeNameRaw !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid store name" });
    }
    const storeName = storeNameRaw.trim();
    if (!storeName) {
      return res
        .status(400)
        .json({ status: false, message: "Store name cannot be empty" });
    }

    // uniqueness checking
    const storeRegex = new RegExp(`^${escapeRegExp(storeName)}$`, "i");
    const checkStore = await SupplierDetailsModel.findOne({
      storeName: storeRegex,
    });
    if (checkStore) {
      return res.status(400).json({
        status: false,
        message: `This store name "${storeName}" already exists`,
      });
    }

    // phone validation
    if (!phoneRaw || typeof phoneRaw !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid phone number" });
    }
    const phone = phoneRaw.trim();
    if (!phone) {
      return res
        .status(400)
        .json({ status: false, message: "Phone number cannot be empty" });
    }

    // address existence
    if (!addressRaw || typeof addressRaw !== "object") {
      return res
        .status(400)
        .json({ status: false, message: "please provide address" });
    }

    // city/state/pincode safe trim
    const cityRaw = addressRaw.city;
    const stateRaw = addressRaw.state;
    const pincodeRaw = addressRaw.pincode;
    const line1Raw = addressRaw.line1;

    if (!cityRaw || typeof cityRaw !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please provide city" });
    }
    const city = cityRaw.trim();
    if (!city) {
      return res
        .status(400)
        .json({ status: false, message: "City cannot be empty" });
    }

    if (!stateRaw || typeof stateRaw !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please provide state" });
    }
    const state = stateRaw.trim();
    if (!state) {
      return res
        .status(400)
        .json({ status: false, message: "State cannot be empty" });
    }

    if (!pincodeRaw || typeof pincodeRaw !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please provide pincode" });
    }
    const pincode = pincodeRaw.trim();
    if (!pincode) {
      return res
        .status(400)
        .json({ status: false, message: "Pincode cannot be empty" });
    }

    // optional line1 trim
    const line1 =
      line1Raw && typeof line1Raw === "string" ? line1Raw.trim() : "";

    // prepare final payload using trimmed values
    const payload = {
      userId,
      storeName,
      phone,
      address: {
        city,
        state,
        pincode,
        ...(line1 ? { line1 } : {}),
      },
    };

    const storeSupplierDetails = await SupplierDetailsModel.create(payload);

    return res.status(201).json({
      status: true,
      message: "Supplier details saved successfully",
      data: storeSupplierDetails,
    });
  } catch (err) {
    console.error("createSupplierDetails error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};
// get Supplier Details

exports.getSupplierDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ status: false, message: "Auth Required" });
    }
    const getSupplierDetails = await SupplierDetailsModel.findOne({
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!getSupplierDetails) {
      return res.status(404).json({
        status: true,
        message: "Supplier details not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Supplier details fetched successfully",
      data: getSupplierDetails,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// update supplier Details
exports.updateSupplierDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ status: false, message: "Auth Required" });
    }

    const userId = req.user._id;
    const data = req.body || {};
    let { storeName, phone, address } = data;

    const existing = await SupplierDetailsModel.findOne({ userId });
    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "Supplier details not found for this user",
      });
    }

    const updatePayload = {};

    if (storeName !== undefined) {
      if (typeof storeName !== "string") {
        return res
          .status(400)
          .json({ status: false, message: "Invalid store name format" });
      }

      storeName = storeName.trim();

      if (!storeName) {
        return res
          .status(400)
          .json({ status: false, message: "Store name cannot be empty" });
      }

      const storeRegex = new RegExp(`^${escapeRegExp(storeName)}$`, "i");
      const duplicate = await SupplierDetailsModel.findOne({
        storeName: storeRegex,
        _id: { $ne: existing._id },
      });

      if (duplicate) {
        return res.status(400).json({
          status: false,
          message: `This store name "${storeName}" already exists`,
        });
      }

      updatePayload.storeName = storeName;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res
          .status(400)
          .json({ status: false, message: "Invalid phone number format" });
      }

      phone = phone.trim();
      if (!phone) {
        return res
          .status(400)
          .json({ status: false, message: "Phone number cannot be empty" });
      }

      updatePayload.phone = phone;
    }

    if (address !== undefined) {
      if (typeof address !== "object" || address === null) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid address object" });
      }

      const newAddress = { ...(existing.address || {}) };

      if (address.city !== undefined) {
        if (typeof address.city !== "string") {
          return res
            .status(400)
            .json({ status: false, message: "Invalid city format" });
        }
        const city = address.city.trim();
        if (!city) {
          return res
            .status(400)
            .json({ status: false, message: "City cannot be empty" });
        }
        newAddress.city = city;
      }

      if (address.state !== undefined) {
        if (typeof address.state !== "string") {
          return res
            .status(400)
            .json({ status: false, message: "Invalid state format" });
        }
        const state = address.state.trim();
        if (!state) {
          return res
            .status(400)
            .json({ status: false, message: "State cannot be empty" });
        }
        newAddress.state = state;
      }

      if (address.pincode !== undefined) {
        if (typeof address.pincode !== "string") {
          return res
            .status(400)
            .json({ status: false, message: "Invalid pincode format" });
        }
        const pincode = address.pincode.trim();
        if (!pincode) {
          return res
            .status(400)
            .json({ status: false, message: "Pincode cannot be empty" });
        }
        newAddress.pincode = pincode;
      }

      if (address.line1 !== undefined) {
        if (address.line1 !== null && typeof address.line1 !== "string") {
          return res
            .status(400)
            .json({ status: false, message: "Invalid address line format" });
        }
        newAddress.line1 = (address.line1 || "").trim();
      }

      updatePayload.address = newAddress;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields provided for update",
      });
    }

    const updated = await SupplierDetailsModel.findByIdAndUpdate(
      existing._id,
      { $set: updatePayload },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Supplier details updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("updateSupplierDetails error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};
