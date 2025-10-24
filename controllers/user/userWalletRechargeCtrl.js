const Razorpay = require("razorpay");
const crypto = require("crypto");
const AIRechageModel = require("../../models/adminModel/adminAiSubscriptionModel");
const useAiRechargeHistoryModel = require("../../models/userModel/userAiRechargeHistoryModel");
const userAIWalletModel = require("../../models/userModel/userWalletModel");
const { isValidObjectId } = require("mongoose");
const { stripTypeScriptTypes } = require("module");

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

function nowIST() {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(nowUTC.getTime() + IST_OFFSET);
}
// get all recharge data

exports.getAllAiRechargeDataUser = async (req, res) => {
  try {
    const getRechargeData = await AIRechageModel.find({ active: true });

    return res.status(200).json({
      status: true,
      message: "Recharge data fetched successfully",
      data: getRechargeData,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// recharge api

exports.createRecharge = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const rechargeId = req.params.rechargeId;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).josn({ status: false, message: "LogIn required" });
    }
    if (!rechargeId || !isValidObjectId(rechargeId)) {
      return res
        .status(400)
        .josn({ status: false, message: "Please Provide valid charge" });
    }

    const recharge = await AIRechageModel.findById(rechargeId);

    if (!recharge || recharge.active === false) {
      return res.status(404).json({ status: false, message: "not found" });
    }

    const tAmount = Number(recharge.rechargeAmount || 0);
    const discountPercent = Number(recharge.discountPercent || 0);

    if (!tAmount || tAmount <= 0) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Recharge Amount" });
    }

    const amountToBePaid = Math.abs(
      Number(((tAmount * (100 - discountPercent)) / 100).toFixed(2))
    );

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amountToBePaid * 100),
      currency: "INR",
      receipt: `receipt_recharge_ai${Date.now()}`,
      notes: {
        rechargeId: rechargeId.toString(),
        userId: userId.toString(),
      },
    });

    const newPayment = await useAiRechargeHistoryModel.create({
      userId,
      aiRechargeId: rechargeId,
      paidAmount: amountToBePaid,
      paymentInfo: {
        razorpay_order_id: razorpayOrder.id,
        razorpay_paymentStatus: "Pending",
      },
      isPaymentVerified: false,
    });

    return res.status(201).json({
      status: true,
      message: "Order created successfully",
      data: {
        payment: newPayment,
        razorpayOrder,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// verify Payment

exports.verifyRechargePayment = async (req, res) => {
  try {
    let {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    const userId = req.user && req.user._id;

    if (!paymentId || !isValidObjectId(paymentId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid missing paymentId" });
    }

    const payment = await useAiRechargeHistoryModel.findById(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json({ status: false, message: "Payment record not found" });
    }

    if (String(payment.userId) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Forbidden" });
    }

    if (!razorpay_payment_id) {
      razorpay_payment_id =
        payment.paymentInfo && payment.paymentInfo.razorpay_payment_id;
    }

    // signature validation

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        payment.paymentInfo = payment.paymentInfo || {};
        payment.paymentInfo.razorpay_paymentStatus = "Failed";
        await payment.save();
        return res
          .status(400)
          .json({ status: false, message: "Invalid signature" });
      }

      // signature valid -> confirm capture (best-effort)
      try {
        const razorpayPayment = await razorpayInstance.payments.fetch(
          razorpay_payment_id
        );

        if (razorpayPayment && razorpayPayment.status !== "captured") {
          payment.paymentInfo = payment.paymentInfo || {};
          payment.paymentInfo.razorpay_paymentStatus = "Failed";
          await payment.save();
          return res.status(400).json({
            status: false,
            message: `Razorpay payment not captured (status: ${razorpayPayment.status})`,
          });
        }
      } catch (err) {
        // If fetch fails, proceed but warn (we already validated signature)
        console.warn(
          "Warning: failed to fetch payment from Razorpay:",
          err.message
        );
      }

      // Mark success
      payment.paymentInfo = payment.paymentInfo || {};
      payment.paymentInfo.razorpay_payment_id = razorpay_payment_id;
      payment.paymentInfo.razorpay_order_id = razorpay_order_id;
      payment.paymentInfo.razorpay_signature = razorpay_signature;
      payment.paymentInfo.razorpay_paymentStatus = "Success";
      payment.isPaymentVerified = true;

      const paidAt = nowIST();
      payment.paidAt = paidAt;

      await payment.save();

      const recharge = await AIRechageModel.findById(payment.aiRechargeId);

      await userAIWalletModel.findOneAndUpdate(
        { userId: userId },
        { $inc: { credit: recharge.creditBalance } },
        { new: true }
      );

      ////////////////////////////////////////////
      // console.log("payment success--1", payment);
      ///////////////////////////////////////////

      return res.status(200).json({
        status: true,
        message: "Payment verified and Recharge activated",
        data: payment,
      });
    }

    // --- Fallback: only razorpay_payment_id provided (no signature) ---
    if (razorpay_payment_id) {
      // Fetch payment from Razorpay to validate
      let razorpayPayment;
      try {
        razorpayPayment = await razorpayInstance.payments.fetch(
          razorpay_payment_id
        );
      } catch (err) {
        console.error("Failed to fetch payment from Razorpay:", err.message);
        payment.paymentInfo = payment.paymentInfo || {};
        payment.paymentInfo.razorpay_paymentStatus = "Failed";
        await payment.save();
        return res.status(400).json({
          status: false,
          message: "Failed to validate payment with Razorpay",
        });
      }

      // Ensure Razorpay says captured
      if (!razorpayPayment || razorpayPayment.status !== "captured") {
        payment.paymentInfo = payment.paymentInfo || {};
        payment.paymentInfo.razorpay_paymentStatus = "Failed";
        await payment.save();
        return res.status(400).json({
          status: false,
          message: `Razorpay payment not captured (status: ${razorpayPayment?.status})`,
        });
      }

      // Optional: check that razorpayPayment.order_id matches DB's stored order id (if any)
      const rpOrderId = razorpayPayment.order_id;
      const dbOrderId =
        payment.paymentInfo && payment.paymentInfo.razorpay_order_id;

      if (dbOrderId && rpOrderId && dbOrderId !== rpOrderId) {
        // mismatch — suspicious
        payment.paymentInfo = payment.paymentInfo || {};
        payment.paymentInfo.razorpay_paymentStatus = "Failed";
        await payment.save();
        return res.status(400).json({
          status: false,
          message:
            "Payment order mismatch (Razorpay payment does not belong to this order/payment record)",
        });
      }

      // All good — mark success and save relevant fields from Razorpay
      payment.paymentInfo = payment.paymentInfo || {};
      payment.paymentInfo.razorpay_payment_id = razorpay_payment_id;
      if (rpOrderId) payment.paymentInfo.razorpay_order_id = rpOrderId;
      payment.paymentInfo.razorpay_signature = razorpay_signature || null;
      payment.paymentInfo.razorpay_paymentStatus = "Success";
      payment.isPaymentVerified = true;

      const paidAt = nowIST();
      payment.paidAt = paidAt;

      const recharge = await AIRechageModel.findById(payment.aiRechargeId);

      await userAIWalletModel.findOneAndUpdate(
        { userId: userId },
        { $inc: { credit: recharge.creditBalance } },
        { new: true }
      );

      await payment.save();

      ////////////////////////////////////////////
      // console.log("payment success--2", payment);
      ///////////////////////////////////////////

      return res.status(200).json({
        status: true,
        message: "Payment validated via Razorpay and Recharge activated",
        data: payment,
      });
    }

    // If we reach here, we don't have enough data to validate
    return res.status(400).json({
      status: false,
      message:
        "Insufficient payment details. Provide razorpay_payment_id (and preferably razorpay_order_id and razorpay_signature).",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// recharge history

exports.rechargeHistory = async (req, res) => {
  try {
    const history = await useAiRechargeHistoryModel.find({
      userId: req.user._id,
      isPaymentVerified: true,
    });

    return res.status(200).json({
      status: true,
      message: "recharge history fetched successfully",
      data: history,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get wallet data

exports.getWalletData = async (req, res) => {
  try {
    const walletData = await userAIWalletModel.findOne({
      userId: req.user._id,
    });

    if (!walletData) {
      return res
        .status(400)
        .json({ status: false, message: "RE Log in required" });
    }
    return res
      .status(200)
      .json({ status: true, message: "wallet amount", data: walletData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
