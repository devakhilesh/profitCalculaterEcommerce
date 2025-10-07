const { isValidObjectId } = require("mongoose");
const SubscriptionModel = require("../../models/adminModel/adminSubscriptionModel");

// create subscriptions

exports.createSubscription = async (req, res) => {
  try {
    let data = req.body;

    let {
      subscriptionName,
      subscriptionType,
      mrpSubscription,
      discountPercent,
      validUpTo,
    } = data;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide required fields" });

    let expectedQueries = [
      "subscriptionName",
      "subscriptionType",
      "mrpSubscription",
      "validUpTo",
    ];
    let queries = Object.keys(data);
    let count = 0;
    for (let i = 0; i < queries.length; i++) {
      if (!expectedQueries.includes(queries[i])) count++;
    }
    if (count > 0) {
      return res.status(400).send({
        status: false,
        message: `All Fields Are Required !: "subscriptionName",
      "subscriptionType",
      "mrpSubscription",
      "validUpTo"`,
      });
    }

    // =============== subscriptionName ===========

    if (typeof subscriptionName !== "string" || subscriptionName.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Please provide valid Subscription Name",
      });
    }

    // subscriptionType

    const vaildSubType = ["Weekly", "Monthly", "Yearly"];

    if (
      typeof subscriptionType !== "string" ||
      !vaildSubType.includes(subscriptionType)
    ) {
      return res.status(400).json({
        status: false,
        message: `Please Provide valid subscription Type: ${vaildSubType}`,
      });
    }

    // check data base single entry only

    const checkAlready = await SubscriptionModel.findOne({
      subscriptionType: subscriptionType,
    });

    if (checkAlready) {
      return res.status(400).json({
        status: false,
        message: "This subscription type is already exist",
      });
    }

    // mrpSubscription

    mrpSubscription = Number(mrpSubscription);

    if (isNaN(mrpSubscription)) {
      return res.status(400).json({
        status: false,
        messsage:
          "Please Provide valid Mrp of Subscription or Subscription amount without discount",
      });
    }

    if (mrpSubscription < 1) {
      return res.status(400).json({
        staus: false,
        message: "Subscription amount should not be less than 1",
      });
    }

    // validUpTo

    validUpTo = Number(validUpTo);

    if (isNaN(validUpTo)) {
      return res.status(400).json({
        status: false,
        message: "Please Provide valid Day for this particular subscription",
      });
    }

    if (data.discountPercent) {
      data.discountPercent = Number(data.discountPercent);

      if (isNaN(data.discountPercent)) {
        return res.status(400).json({
          status: false,
          message:
            "Please Provide valid discount percent on subscription amoun",
        });
      }
    }

    const createSubs = await SubscriptionModel.create(data);

    if (!createSubs) {
      return res.status(400).json({
        status: false,
        message: "There is something worong in creation",
      });
    }

    return res
      .status(201)
      .json({ status: true, message: "Subscription Created Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// update subscription

exports.updateSubscription = async (req, res) => {
  try {
    let data = req.body;
    const { subscriptionId } = req.params;

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res.status(400).json({
        status: false,
        message: "Please Provide valid subscription id",
      });
    }

    let { subscriptionName, subscriptionType, mrpSubscription, validUpTo } =
      data;

    // =============== subscriptionName ===========
    if (subscriptionName) {
      if (
        typeof subscriptionName !== "string" ||
        subscriptionName.length === 0
      ) {
        return res.status(400).json({
          status: false,
          message: "Please provide valid Subscription Name",
        });
      }
    }
    //============== subscriptionType ================

    if (vaildSubType) {
      const vaildSubType = ["Weekly", "Monthly", "Yearly"];

      if (
        typeof subscriptionType !== "string" ||
        !vaildSubType.includes(subscriptionType)
      ) {
        return res.status(400).json({
          status: false,
          message: `Please Provide valid subscription Type: ${vaildSubType}`,
        });
      }

      const checkAlready = await SubscriptionModel.findOne({
        subscriptionType: subscriptionType,
        _id: { $ne: subscriptionId },
      });

      if (checkAlready) {
        return res.status(400).json({
          status: false,
          message: "This subscription type is already exist",
        });
      }
    }
    //======= check data base single entry only =======

    //=========== mrpSubscription =============
    if (mrpSubscription) {
      mrpSubscription = Number(mrpSubscription);

      if (isNaN(mrpSubscription)) {
        return res.status(400).json({
          status: false,
          messsage:
            "Please Provide valid Mrp of Subscription or Subscription amount without discount",
        });
      }

      if (mrpSubscription < 1) {
        return res.status(400).json({
          staus: false,
          message: "Subscription amount should not be less than 1",
        });
      }
    }
    //=============== validUpTo =================

    if (validUpTo) {
      validUpTo = Number(validUpTo);

      if (isNaN(validUpTo)) {
        return res.status(400).json({
          status: false,
          message: "Please Provide valid Day for this particular subscription",
        });
      }
    }

    if (data.discountPercent) {
      data.discountPercent = Number(data.discountPercent);

      if (isNaN(data.discountPercent)) {
        return res.status(400).json({
          status: false,
          message:
            "Please Provide valid discount percent on subscription amoun",
        });
      }
    }

    const updateSubscription = await SubscriptionModel.findByIdAndUpdate(
      subscriptionId,
      { ...data }
    );

    if (!updateSubscription) {
      return res.status(400).json({
        status: false,
        message: "There is something worong in updation",
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "Subscription Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// getAll subcriptions

exports.getAllSubscription = async (req, res) => {
  try {
    const getAllSubscription = await SubscriptionModel.find({ active: true });
    return res.status(200).json({
      status: true,
      message: "All Subscription fetched successfully",
      data: getAllSubscription,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// delete subscription

exports.deleteSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res.status(400).json({
        status: false,
        message: "Please Provide valid subscription id",
      });
    }
    const getAllSubscription = await SubscriptionModel.findByIdAndDelete(
      subscriptionId
    );
    return res.status(200).json({
      status: true,
      message: " Subscription deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
