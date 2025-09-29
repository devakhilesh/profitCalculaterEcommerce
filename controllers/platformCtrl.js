const adminAuthModel = require("../models/userModel");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const platformModel = require("../models/platformModel");
const { isValidObjectId } = require("mongoose");



exports.adminOrUserAuthRegister = async (req, res) => {
  try {
    const data = req.body;
    const { email, password, role } = data;

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide email" });
    }

    let ValidRole = ["admin", "user"];

    if (!role || !ValidRole.includes(role)) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Valid Role" });
    }

    const check = await adminAuthModel.findOne({ email: email });

    if (check) {
      return res
        .status(400)
        .json({ status: false, message: "This email is already exist" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide password" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const saveAdmin = await adminAuthModel.create({
      email: email,
      password: hashPass,
      role: req.body.role,
    });

    return res.status(201).json({
      status: true,
      message: "registered successfully",
      data: saveAdmin,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.adminOrUserAuthLogIn = async (req, res) => {
  try {
    const data = req.body;

    const { email, password } = data;

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide email" });
    }

    const check = await adminAuthModel.findOne({ email: email });

    if (!check) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Credentials " });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide password" });
    }

    const checkPasss = await bcrypt.compare(password, check.password);

    if (!checkPasss) {
      return res
        .status(400)
        .json({ status: false, messgage: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: check._id, role: check.role },
      process.env.JWT_SECERET
    );

    return res
      .status(201)
      .json({ status: true, message: "LogIn Success", token: token });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// admin plateform creation

exports.createplateform = async (req, res) => {
  try {
    let data = req.body;

    let { name, country, defaultGstPercent, status } = data;

    if (!name) {
      return res
        .status(400)
        .json({ status: false, message: "please provide plateForm Name" });
    }

    const check = await platformModel.findOne({ name: name });

    if (check) {
      return res.status(400).json({
        status: false,
        messgage: "This Platform name is already exist ",
      });
    }

    const savePlatForm = await platformModel.create(data);

    return res.status(200).json({
      status: true,
      message: "Platform data saved successfully",
      data: savePlatForm,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// update plateform

exports.updatePlateform = async (req, res) => {
  try {
    let data = req.body;

    const platformId = req.params.platformId;

    if (!platformId || !isValidObjectId(platformId)) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Valid PlatFormId" });
    }
    let { name, country, defaultGstPercent, status } = data;

    const check = await platformModel.findOne({
      name: name,
      _id: { $ne: platformId },
    });

    if (check) {
      return res.status(400).json({
        status: false,
        messgage: "This Platform name is already exist ",
      });
    }

    const updatePlatForm = await platformModel.findByIdAndUpdate(
      platformId,
      {
        ...data,
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Platform data updated successfully",
      data: updatePlatForm,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//delete

exports.deletePlateform = async (req, res) => {
  try {
    const platformId = req.params.platformId;

    if (!platformId || !isValidObjectId(platformId)) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Valid PlatFormId" });
    }

    const deletePlatForm = await platformModel.findByIdAndDelete(platformId);
    if (!deletePlatForm) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }
    return res.status(200).json({
      status: true,
      message: "Platform data deleted successfully",
      // data: updatePlatForm,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ============= get all ============

exports.getAll = async (req, res) => {
  try {
    const getAll = await platformModel.find({ status: "active" });

    return res.status(200).json({ status: true, message: getAll });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
