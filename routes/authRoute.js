const express = require("express");

const {
  adminAuthRegister,
  adminAuthLogIn,
  adminOrUserAuthRegister,
  adminOrUserAuthLogIn,
} = require("../controllers/platformCtrl");

const router = express.Router();

router.route("/register").post(adminOrUserAuthRegister);

router.route("/logIn").post(adminOrUserAuthLogIn);

module.exports = router;
