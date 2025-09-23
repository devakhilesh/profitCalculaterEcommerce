const express = require("express");

const {
  adminAuthRegister,
  adminAuthLogIn,
} = require("../controllers/platformCtrl");

const router = express.Router();

router.route("/register").post(adminAuthRegister);

router.route("/logIn").post(adminAuthLogIn);

module.exports = router;
