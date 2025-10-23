const { isValidObjectId } = require("mongoose");
const AIRechageModel = require("../../models/adminModel/adminAiSubscriptionModel");

exports.createAIRecharge = async (req, res) => {
  try {
    let data = req.body;

    let { rechargeName, rechargeAmount, discountPercent, creditBalance } = data;
    // Recharge Name
    if (!rechargeName || typeof rechargeName !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "please Provide recharge name" });
    }
    // Recharge Amount
    if (!rechargeAmount) {
      return res
        .status(400)
        .json({ status: false, message: "please Provide recharge Amount" });
    }

    rechargeAmount = Number(data.rechargeAmount);

    if (isNaN(rechargeAmount)) {
      return res.status(400).json({
        status: false,
        message: "Please Provide valid recharge amount",
      });
    }
    // discount Percent

    if (discountPercent) {
      discountPercent = Number(data.discountPercent);

      if (isNaN(discountPercent)) {
        return res.status(400).json({
          status: false,
          message: "Please Provide valid recharge discount ",
        });
      }
    }
    // credit Balance

    if (!creditBalance) {
      return res
        .status(400)
        .json({ status: false, message: "please Provide recharge Amount" });
    }

    creditBalance = Number(data.creditBalance);

    if (isNaN(creditBalance)) {
      return res.status(400).json({
        status: false,
        message: "Please Provide valid recharge Balance",
      });
    }

    const storeRechargeData = await AIRechageModel.create(data);

    if (!storeRechargeData) {
      return res.status(400).json({
        status: false,
        message: "Something wents worng storing recharge data",
      });
    }

    return res.status(201).json({
      status: true,
      message: "recharge data stored successfully",
      data: storeRechargeData,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// get all recharge data

exports.getAllAiRechargeData = async (req, res) => {
  try {
    const getRechargeData = await AIRechageModel.find();

    return res.status(200).json({
      status: true,
      message: "Recharge data fetched successfully",
      data: getRechargeData,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// update recharge

exports.updateRechargeData = async (req, res) => {
  try {
    let data = req.body;
    const aiRechargeId = req.params.aiRechargeId;
    if (!aiRechargeId || !isValidObjectId(aiRechargeId)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid recharge Id" });
    }
    let {
      rechargeName,
      rechargeAmount,
      discountPercent,
      creditBalance,
      active,
    } = data;
    // Recharge Name
    if (rechargeName) {
      if (typeof rechargeName !== "string") {
        return res.status(400).json({
          status: false,
          message: "please Provide valid recharge name",
        });
      }
    }
    // Recharge Amount
    if (rechargeAmount) {
      rechargeAmount = Number(data.rechargeAmount);

      if (isNaN(rechargeAmount)) {
        return res.status(400).json({
          status: false,
          message: "Please Provide valid recharge amount",
        });
      }
    }

    // discount Percent

    if (discountPercent) {
      discountPercent = Number(data.discountPercent);

      if (isNaN(discountPercent)) {
        return res.status(400).json({
          status: false,
          message: "Please Provide valid recharge discount ",
        });
      }
    }
    // credit Balance

    if (creditBalance) {
      creditBalance = Number(data.creditBalance);

      if (isNaN(creditBalance)) {
        return res.status(400).json({
          status: false,
          message: "Please Provide valid recharge Balance",
        });
      }
    }

    // $ne to prevent duplicate name of recharge

    const storeRechargeData = await AIRechageModel.findByIdAndUpdate(
      aiRechargeId,
      { ...data },
      { new: true }
    );

    if (!storeRechargeData) {
      return res.status(400).json({
        status: false,
        message: "Something wents worng storing recharge data",
      });
    }

    return res.status(201).json({
      status: true,
      message: "recharge data updated successfully",
      data: storeRechargeData,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// delete

exports.deleteRechargeData = async (req, res) => {
  try {
    const aiRechargeId = req.params.aiRechargeId;
    if (!aiRechargeId || !isValidObjectId(aiRechargeId)) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid recharge Id" });
    }

    const deleteRechargeData = await AIRechageModel.findByIdAndDelete(
      aiRechargeId,
      { ...data },
      { new: true }
    );

    if (!deleteRechargeData) {
      return res.status(404).json({
        status: false,
        message: "Not found",
      });
    }

    return res.status(201).json({
      status: true,
      message: "recharge data deleted successfully",
      //   data: storeRechargeData,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
