const express = require("express");
const {
  getAllEnhancedImages,
  deleteEnhancedImage,
  imgToimgEnhancer,
} = require("../controllers/aiCtrl/imgEnhencerCtrl");
const { authentication } = require("../middi/userAuth");

const router = express.Router();

router.route("/imgtoimg").post(imgToimgEnhancer);
router.route("/imgtoimg/getAll").get(authentication, getAllEnhancedImages);
router
  .route("/imgtoimg/delete/:imageId")
  .get(authentication, deleteEnhancedImage);

module.exports = router;

/* 
complete route is

base +/user/enhanced/imgtoimg
base +/user/enhanced/imgtoimg/getAll
base +/user/enhanced/delete/imgtoimg/:imageId


*/
