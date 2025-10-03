const { isValidObjectId } = require("mongoose");
const Amazon_ProfitLossCalculatorModel = require("../../models/amazon/amazonProfitLossCalcModel");

///============================ Profit / Loss Calculator =========================///

exports.createAmazonProfitLossCalc = async (req, res) => {
  try {
    const platformId = req.params.platformId;
    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }

    if (!req.body.productName) {
      return res.status(400).json({
        status: false,
        message: "Provide the Name of the product to make history for future",
      });
    }

    req.body.userId = req.user._id;

    const saveData = await Amazon_ProfitLossCalculatorModel.create({
      ...req.body,
      platformId,
    });

    return res.status(201).json({ status: true, data: saveData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//===================== Update record ============

exports.updateAmazonProfitLossCalc = async (req, res) => {
  try {
    const { ProfitLossCalcId } = req.params;
    if (!ProfitLossCalcId || !isValidObjectId(ProfitLossCalcId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record ProfitLossCalcId" });
    }

    const updated = await Amazon_ProfitLossCalculatorModel.findOneAndUpdate(
      { _id: ProfitLossCalcId, userId: req.user._id },
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

// =================== get All by Platform Id =======
// pagination

exports.getAllAmazonProfitLossCalc = async (req, res) => {
  try {
    const platformId = req.params.platformId;

    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }
    const getAll = await Amazon_ProfitLossCalculatorModel.find({
      userId: req.user._id,
      platformId: platformId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ status: true, data: getAll });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ================== get partiular record by id =============

exports.getAmazonProfitLossCalcById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }
    const getData = await Amazon_ProfitLossCalculatorModel.findOne({
      _id: id,
      userId: req.user._id,
    });
    if (!getData) {
      return res.status(404).json({ status: false, message: "data not found" });
    }
    return res.status(200).json({ status: true, data: getData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ====================== delete ====================

exports.deleteAmazonProfitLossCalc = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }

    const deleted = await Amazon_ProfitLossCalculatorModel.findByIdAndDelete(
      id
    );
    if (!deleted) {
      return res.status(404).json({ status: false, data: "data not found" });
    }
    return res.status(200).json({ status: true, data: deleted });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};



