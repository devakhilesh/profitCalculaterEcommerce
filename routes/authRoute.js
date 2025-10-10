const express = require("express");

const {
  adminAuthRegister,
  adminAuthLogIn,
  adminOrUserAuthRegister,
  adminOrUserAuthLogIn,
  signInWithGoogle,
  updateUser,
  getProfile,
} = require("../controllers/platformCtrl");
const { authentication } = require("../middi/userAuth");

const router = express.Router();

router.route("/register").post(adminOrUserAuthRegister);

router.route("/logIn").post(adminOrUserAuthLogIn);

// user signUp with google
router.route("/signInWithGoogle").post(signInWithGoogle);

router.route("/update").put(authentication,updateUser);

router.route("/get").get(authentication, getProfile);

module.exports = router;

/* 
localhost:3001/auth

*signUpWith google email, fcmToken, name,*

/signInWithGoogle

*update Profile only  name *

/update

*get Profile*

/get



*/
