const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const Razorpay = require("razorpay");
const crypto = require("crypto");
const userSubscribedModel = require("../models/userSubscribedMode");
const SubscriptionModel = require("../models/adminModel/adminSubscriptionModel");

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

function addDays(date, days) {
  const out = new Date(date);
  out.setDate(out.getDate() + Number(days));
  return out;
}

function daysDiff(fromDate, toDate) {
  const ms = toDate - fromDate;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

//  Create Razorpay order and a pending subscription record.

exports.createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const subscriptionId = req.params.subscriptionId;

    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or missing subscriptionId" });
    }

    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ status: false, message: "Subscription not found" });
    }

    // Use IST
    const start = nowIST();

    const durationDays = Number(subscription.validUpTo) || 0;

    if (durationDays <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid subscription validity configured",
      });
    }

    const expectedEnd = addDays(start, durationDays);

    const activeSub = await userSubscribedModel
      .findOne({
        userId,
        isPaymentVerified: true,
        "paymentInfo.razorpay_paymentStatus": "Success",
        expairySubsDateTime: { $gt: start },
      })
      .sort({ expairySubsDateTime: -1 });

    if (activeSub) {
      const remainingDays = daysDiff(
        start,
        new Date(activeSub.expairySubsDateTime)
      );
      return res.status(400).json({
        status: false,
        message: "You already have an active subscription",
        data: {
          subscriptionId: activeSub.subscriptionId,
          subscribedDateTime: activeSub.subscribedDateTime,
          expairySubsDateTime: activeSub.expairySubsDateTime,
          remainingDays,
        },
      });
    }
    // Example: mrp = 799, discountPercent = 50 => amount = 799 * (100 - 50)/100 = 399.5

    const mrp = Number(subscription.mrpSubscription || 0);
    const discountPercent = Number(subscription.discountPercent || 0);
    if (!mrp || mrp <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid subscription amount configured",
      });
    }
    const amountToBePaid = Math.abs(
      Number(((mrp * (100 - discountPercent)) / 100).toFixed(2))
    );

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amountToBePaid * 100),
      currency: "INR",
      receipt: `receipt_subscription${Date.now()}`,
      notes: {
        subscriptionId: subscriptionId.toString(),
        userId: userId.toString(),
      },
    });

    const newPayment = await userSubscribedModel.create({
      userId,
      subscriptionId,
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
        expectedSubscription: {
          start: start,
          end: expectedEnd,
          durationDays,
          amountToBePaid,
        },
      },
    });
  } catch (err) {
    console.error("createPaymentOrder error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// verify payment

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    const userId = req.user && req.user._id;

    if (!paymentId || !isValidObjectId(paymentId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or missing paymentId" });
    }

    const payment = await userSubscribedModel.findById(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json({ status: false, message: "Payment record not found" });
    }

    if (String(payment.userId) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Forbidden" });
    }

    // If already verified, return existing record (idempotent)
    if (
      payment.isPaymentVerified &&
      payment.paymentInfo &&
      payment.paymentInfo.razorpay_paymentStatus === "Success"
    ) {
      return res.status(200).json({
        status: true,
        message: "Payment already verified",
        data: payment,
      });
    }

    // Validate signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // mark failed
      payment.paymentInfo = payment.paymentInfo || {};

      payment.paymentInfo.razorpay_paymentStatus = "Failed";
      await payment.save();
      return res
        .status(400)
        .json({ status: false, message: "Invalid signature" });
    }

    //  Razorpay to ensure status = 'captured'
    let razorpayPayment;
    try {
      razorpayPayment = await razorpayInstance.payments.fetch(
        razorpay_payment_id
      );
    } catch (err) {
      // If fetch fails, we proceed but log a warning — you may choose to fail here
      console.warn(
        "Warning: failed to fetch payment from Razorpay:",
        err.message
      );
    }

    // Check captured status if razorpayPayment available
    const paymentStatusFromRazor = razorpayPayment
      ? razorpayPayment.status
      : null;
    if (paymentStatusFromRazor && paymentStatusFromRazor !== "captured") {
      payment.paymentInfo = payment.paymentInfo || {};
      payment.paymentInfo.razorpay_paymentStatus = "Failed";
      await payment.save();
      return res.status(400).json({
        status: false,
        message: `Razorpay payment not captured (status: ${paymentStatusFromRazor})`,
      });
    }

    // Mark success
    payment.paymentInfo = payment.paymentInfo || {};
    payment.paymentInfo.razorpay_payment_id = razorpay_payment_id;
    payment.paymentInfo.razorpay_signature = razorpay_signature;
    payment.paymentInfo.razorpay_paymentStatus = "Success";
    payment.isPaymentVerified = true;

    const paidAt = nowIST();
    payment.paidAt = paidAt;
    payment.subscribedDateTime = paidAt;

    // Compute expiry based on admin subscription model
    const subscription = await SubscriptionModel.findById(
      payment.subscriptionId
    );
    const durationDays = Number(subscription.validUpTo);

    payment.expairySubsDateTime = addDays(paidAt, durationDays);

    await payment.save();

    return res.status(200).json({
      status: true,
      message: "Payment verified and subscription activated",
      data: payment,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get history of payments

exports.getSingleSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const paymentId = req.params.paymentId;

    if (!paymentId || !isValidObjectId(paymentId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or missing paymentId" });
    }

    const record = await userSubscribedModel
      .findById(paymentId)
      .populate("subscriptionId");

    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Payment record not found" });
    }

    // Authorization: owner or admin
    if (String(record.userId) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Forbidden" });
    }

    const now = nowIST();
    const expiry = record.expairySubsDateTime
      ? new Date(record.expairySubsDateTime)
      : null;

    // Base response shape
    const baseData = {
      paymentId: record._id,
      subscriptionId: record.subscriptionId
        ? record.subscriptionId._id
        : record.subscriptionId,
      subscriptionDetails: record.subscriptionId || null,
      paidAmount: record.paidAmount,
      paidAt: record.paidAt,
      subscribedDateTime: record.subscribedDateTime,
      expairySubsDateTime: record.expairySubsDateTime,
      paymentInfo: record.paymentInfo,
      isPaymentVerified: record.isPaymentVerified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    // If expiry not set
    if (!expiry) {
      return res.status(200).json({
        status: true,
        isActive: false,
        message: "Subscription record found but expiry date is not set",
        data: baseData,
      });
    }

    // If active (now <= expiry)
    if (now <= expiry) {
      const remainingMs = expiry - now;
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const MS_PER_HOUR = 1000 * 60 * 60;
      const MS_PER_MIN = 1000 * 60;

      const remainingDays = Math.floor(remainingMs / MS_PER_DAY);
      const remainingHours = Math.floor(
        (remainingMs % MS_PER_DAY) / MS_PER_HOUR
      );
      const remainingMinutes = Math.floor(
        (remainingMs % MS_PER_HOUR) / MS_PER_MIN
      );

      return res.status(200).json({
        status: true,
        isActive: true,
        message: "Subscription is active",
        data: {
          ...baseData,
          remaining: {
            days: remainingDays,
            hours: remainingHours,
            minutes: remainingMinutes,
            remainingDaysCeil: daysDiff(now, expiry),
          },
        },
      });
    }

    // Else expired (now > expiry)
    const expiredMs = now - expiry;
    const MS_PER_HOUR = 1000 * 60 * 60;
    const expiredDaysAgo = daysDiff(expiry, now);
    const expiredHoursAgo = Math.floor(expiredMs / MS_PER_HOUR);

    return res.status(200).json({
      status: true,
      isActive: false,
      message: "Subscription expired",
      data: {
        ...baseData,
        expired: {
          daysAgo: expiredDaysAgo,
          hoursAgo: expiredHoursAgo,
        },
      },
    });
  } catch (err) {
    console.error("getSingleHistory error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// Get all subscription history

exports.getAllSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total verified subscriptions
    const total = await userSubscribedModel.countDocuments({
      userId,
      isPaymentVerified: true,
      "paymentInfo.razorpay_paymentStatus": "Success",
    });

    // Fetch paginated and latest (descending) subscription history
    const subscribedHistory = await userSubscribedModel
      .find({
        userId,
        isPaymentVerified: true,
        "paymentInfo.razorpay_paymentStatus": "Success",
      })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        subscriptionHistory: subscribedHistory,
      },
    });
  } catch (err) {
    console.error("getAllHistory error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// Check subscription status for current user

exports.checkSubscription = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ status: false, message: "Unauthorized" });

    const now = nowIST();

    // Find the latest successful (verified) subscription record (most recent expiry first)
    const latestSuccess = await userSubscribedModel
      .findOne({
        userId,
        isPaymentVerified: true,
        "paymentInfo.razorpay_paymentStatus": "Success",
      })
      .sort({ expairySubsDateTime: -1 })
      .populate("subscriptionId");

    if (!latestSuccess) {
      const plans = await SubscriptionModel.find({ isActive: true }).lean();
      return res.status(200).json({
        status: true,
        isActive: false,
        message: "No active subscription found",
        data: {
          payment: null,
          plans: plans.length ? plans : null,
        },
      });
    }

    const expiry = latestSuccess.expairySubsDateTime
      ? new Date(latestSuccess.expairySubsDateTime)
      : null;

    if (!expiry) {
      // If expiry missing, treat as not active but include the record
      return res.status(200).json({
        status: true,
        isActive: false,
        message: "Subscription record found but expiry not set",
        data: {
          payment: latestSuccess,
        },
      });
    }

    if (now <= expiry) {
      // still active
      const remainingDays = daysDiff(now, expiry);
      const remainingMs = expiry - now;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      return res.status(200).json({
        status: true,
        isActive: true,
        message: "Subscription is active",
        data: {
          subscriptionId: latestSuccess.subscriptionId
            ? latestSuccess.subscriptionId._id
            : latestSuccess.subscriptionId,
          subscriptionDetails: latestSuccess.subscriptionId || null,
          subscribedDateTime: latestSuccess.subscribedDateTime,
          expairySubsDateTime: latestSuccess.expairySubsDateTime,
          remainingDays,
          remainingHours,
          paymentInfo: latestSuccess.paymentInfo,
        },
      });
    } else {
      // expired
      const expiredDaysAgo = daysDiff(expiry, now);
      return res.status(200).json({
        status: true,
        isActive: false,
        message: "Subscription expired",
        data: {
          subscriptionId: latestSuccess.subscriptionId
            ? latestSuccess.subscriptionId._id
            : latestSuccess.subscriptionId,
          subscriptionDetails: latestSuccess.subscriptionId || null,
          subscribedDateTime: latestSuccess.subscribedDateTime,
          expairySubsDateTime: latestSuccess.expairySubsDateTime,
          expiredDaysAgo,
          paymentInfo: latestSuccess.paymentInfo,
        },
      });
    }
  } catch (err) {
    console.error("checkSubscription error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// public key

exports.getRazorpayPublicKey = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: true, key: process.env.RAZORPAY_API_KEY });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};
