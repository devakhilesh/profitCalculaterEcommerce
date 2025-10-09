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

/// signUp from google  for user 

/// logIn with google ///////////
exports.signInWithGoogle = async (req, res) => {
  try {
    const data = req.body;
    const { email, fcmToken, name, } = data;

    if (!email || !name) {
      return res
        .status(400)
        .json({ status: false, message: "Unable to log in with Google" });
    }

     data.role = "user"
    // data.isVerified = true;

    let user = await adminAuthModel.findOne({ email: email });
    //bcrypt

    // const hashing = bcrypt.hashSync(fcmToken, 10);

    if (!user) {
      //   data.fcmToken = hashing;

      user = await adminAuthModel.create(data);

       const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECERET
    );

      return res.status(200).json({
        status: true,
        message: "User created successfully",
        data: user,
        token: token,
      });
    }

    // let fcmTokenCompare = await bcrypt.compare(fcmToken, user.fcmToken);

    // if (!fcmTokenCompare)
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "fcmToken is invalid" });
    // data.fcmToken = hashing;

       const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECERET
    );

    await adminAuthModel.findByIdAndUpdate(
      user._id,
      { fcmToken: data.fcmToken },
      { new: true }
    );

    // let updatefcm;

    // if (user.fcmToken) {
    //   if (fcmToken) {
    //     await adminAuthModel.findByIdAndUpdate(
    //       user._id,
    //       { fcmToken: fcmToken },
    //       { new: true }
    //     );
    //   }
    // }
    // console.log(updatefcm,"fcmToken Updated Successfully")

    return res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: user,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// update

exports.updateUser = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "UserId is required" });
    }
    if (data.name && typeof data.name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Name should be a string" });
    }

    const user = await adminAuthModel.findByIdAndUpdate(
      userId,
      { name: data.name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "User updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


// get User Profile
exports.getProfile = async (req, res) => {
  try {
    const getDetails = await adminAuthModel.findById(req.user._id);

    return res
      .status(200)
      .json({ status: true, message: "profile", data: getDetails });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

////////=========================================================================================//
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
