const userAuthModel = require("../models/userModel");

const jwt = require("jsonwebtoken");
const userSubscribedModel = require("../models/userSubscribedMode");

function nowIST() {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(nowUTC.getTime() + IST_OFFSET);
}

function daysDiff(fromDate, toDate) {
  const ms = toDate - fromDate;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// user Authentication
9
exports.authentication = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Log In Required" });
    }

    jwt.verify(token, process.env.JWT_SECERET, async function (err, decoded) {
      if (err) {
        return res.status(401).json({ status: false, message: err.message });
      }
      req.user = decoded;
      console.log(req.user.role, req.user._id);
      next();
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// userAuthorization

exports.userAuthorization = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized Access" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// admin Authorization

exports.adminAuthorization = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized Access" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// subscription check middleware

exports.checkSubscriptionMiddi = async (req, res, next) => {
  try {
    //==================== dummy ================
    return next();

    //====================dummy====================

    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    if (userId.toString() === "68e9f1cd0c024c983210f1f8") {
      return next();
    }

    const now = nowIST();

    // successful (verified) subscription record
    const latestSuccess = await userSubscribedModel
      .findOne({
        userId,
        isPaymentVerified: true,
        "paymentInfo.razorpay_paymentStatus": "Success",
      })
      .sort({ expairySubsDateTime: -1 })
      .populate("subscriptionId");

    // If no successful subscriptions found
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

    // Parse 'expairySubsDateTime'
    const expiry = latestSuccess.expairySubsDateTime
      ? new Date(latestSuccess.expairySubsDateTime)
      : null;

    // If expiry is missing
    if (!expiry || isNaN(expiry.getTime())) {
      const plans = await SubscriptionModel.find({ isActive: true }).lean();
      return res.status(200).json({
        status: true,
        isActive: false,
        message: "Subscription record found but expiry not set",
        data: {
          payment: latestSuccess,
          plans: plans.length ? plans : null,
        },
      });
    }

    // Active subscription
    if (now <= expiry) {
      const remainingMs = expiry - now;
      const remainingDays = daysDiff(now, expiry);
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));

      //subscription summary
      req.subscription = {
        isActive: true,
        subscriptionId: latestSuccess.subscriptionId
          ? latestSuccess.subscriptionId._id
          : latestSuccess.subscriptionId,
        subscriptionDetails: latestSuccess.subscriptionId || null,
        subscribedDateTime: latestSuccess.subscribedDateTime,
        expairySubsDateTime: latestSuccess.expairySubsDateTime,
        remainingDays,
        remainingHours,
        paymentInfo: latestSuccess.paymentInfo,
        raw: latestSuccess,
      };
      return next();
    } else {
      // Expired subscription with plans show
      const expiredDaysAgo = daysDiff(expiry, now);
      const plans = await SubscriptionModel.find({ isActive: true }).lean();

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
          plans: plans.length ? plans : null,
        },
      });
    }
  } catch (err) {
    console.error("checkSubscription error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};
