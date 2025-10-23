const express = require("express");
const { authentication, userAuthorization, checkSubscriptionMiddi } = require("../middi/userAuth");

const {
  removeBackground,
  getAllBackgroundRemovedImages,
  deleteBackgroundRemovedImage,
} = require("../controllers/aiCtrl/backgroundRemoverCtrl");


const router = express.Router();

router
  .route("/upload")
  .post(authentication, userAuthorization,checkSubscriptionMiddi, removeBackground);
router
  .route("/getAll")
  .get(authentication, userAuthorization, getAllBackgroundRemovedImages);
router
  .route("/delete/:imageId")
  .delete(authentication, userAuthorization, deleteBackgroundRemovedImage);


module.exports = router;
