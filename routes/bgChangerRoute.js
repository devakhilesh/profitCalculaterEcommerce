const express = require("express");
const { authentication, userAuthorization } = require("../middi/userAuth");
const {  replaceBackground, getAllReplacedImages, deleteReplacedImage } = require("../controllers/aiCtrl/bgChangerCtrl");

// const { replaceBackground, getAllReplacedImages, deleteReplacedImage } = require("../controllers/bgChangerCtrl");

const router = express.Router();

router
  .route("/upload")
  .post(authentication, userAuthorization,replaceBackground );
router
  .route("/getAll")
  .get(authentication, userAuthorization, getAllReplacedImages);
router
  .route("/delete/:imageId")
  .delete(authentication, userAuthorization, deleteReplacedImage);


module.exports = router;
