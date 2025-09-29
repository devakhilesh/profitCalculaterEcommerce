const { isValidObjectId } = require("mongoose");
const SellingPriceCalculatorModel = require("../../models/sellingPriceCalculatorModel");



///============================ selling Price Calculator =========================///

exports.createSellingPriceCalc = async (req, res) => {
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

    const saveData = await SellingPriceCalculatorModel.create({
      ...req.body,
      platformId,
    });

    return res.status(201).json({ status: true, data: saveData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//===================== Update record ============

exports.updateSellingPriceCalc = async (req, res) => {
  try {
    const { sellingPriceCalcId } = req.params;
    if (!sellingPriceCalcId || !isValidObjectId(sellingPriceCalcId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record sellingPriceCalcId" });
    }

    const updated =
      await SellingPriceCalculatorModel.findOneAndUpdate(
        { _id: sellingPriceCalcId, userId: req.user._id },
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

exports.getAllSellingPriceCalc = async (req, res) => {
  try {
    const platformId = req.params.platformId;

    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }
    const getAll = await SellingPriceCalculatorModel.find({
      userId: req.user._id,
      platformId: platformId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ status: true, data: getAll });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ================== get partiular record by id =============

exports.getSellingPriceCalcById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }
    const getData = await SellingPriceCalculatorModel.findOne({
      _id: id,
      userId: req.user._id,
    });
    if (!getData) {
      return res.status(404).json({ status: false, message: "data not found" });
    }
    return res.status(200).json({ status: true, data: getData });
  }
  catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// ====================== delete ====================

exports.deleteSellingPriceCalc = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid record id" });
    }

    const deleted =
      await SellingPriceCalculatorModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: false, data: "data not found" });
    }
    return res.status(200).json({ status: true, data: deleted });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
