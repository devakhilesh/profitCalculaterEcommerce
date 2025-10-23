const express = require("express");
const {
  imgToimgVariations,
} = require("../../controllers/aiCtrl/variationImageCtrl");
const { authentication } = require("../../middi/userAuth");

const router = express.Router();

router.route("/imgVariation").post(authentication, imgToimgVariations);

module.exports = router;

/* 
base+/user/imgVariation
*/
