const express = require("express");
const { authentication, userAuthorization } = require("../middi/userAuth");
const { removeBackground, getAllBackgroundRemovedImages, deleteBackgroundRemovedImage } = require("../controllers/backgroundRemoverCtrl");

const router = express.Router();

router
  .route("/upload")
  .post(authentication, userAuthorization, removeBackground);
router
  .route("/getAll")
  .get(authentication, userAuthorization, getAllBackgroundRemovedImages);
router
  .route("/delete/:imageId")
  .delete(authentication, userAuthorization, deleteBackgroundRemovedImage);

module.exports = router;
