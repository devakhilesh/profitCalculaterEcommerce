const userAuthModel = require("../models/userModel");

const jwt = require("jsonwebtoken");

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
