const { isValidObjectId } = require("mongoose");
const productSPCP_ProfitLossCalcModel = require("../models/productWiseProfithistoryModel");

// ========== Create record ================
exports.createProfitHistory = async (req, res) => {
  try {
    const platformId = req.params.platformId;

    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }
    // const {platformId} = req.body;

    //   if (!platformId || !isValidObjectId(platformId)) {
    //     return res
    //       .status(400)
    //       .json({ status: false, message: "Invalid platformId" });
    //   }

    if (!req.body.productName) {
      return res.status(400).json({
        status: false,
        message: "Provide the Name of the product to make history for future",
      });
    }

    req.body.userId = req.user._id


    const saveData = await productSPCP_ProfitLossCalcModel.create({
      ...req.body,
      platformId,
    });

    return res.status(201).json({ status: true, data: saveData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//=============== Update record ============
exports.updateProfitHistory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }

    const updated = await productSPCP_ProfitLossCalcModel.findByIdAndUpdate(
      id,
      req.user._id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    return res.status(200).json({ status: true, data: updated });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ========== get All by Platform Id =======
exports.getAllProfitHistory = async (req, res) => {
  try {
    const platformId = req.params.platformId;

    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }
    const getAll = await productSPCP_ProfitLossCalcModel.find({
      userId: req.user._id,
      platformId: platformId,
    }).sort({createdAt:-1});

    return res.status(200).json({ status: true, data: getAll });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ============= delete ====================

exports.deleteProfitHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }

    const deleted = await productSPCP_ProfitLossCalcModel.findByIdAndDelete(id);

    return res.status(200).json({ status: true, data: deleted });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
