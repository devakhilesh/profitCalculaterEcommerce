const express = require("express")
const { imgToimgVariations } = require("../controllers/variationImageCtrl")

const router = express.Router()

router.route("/imgVariation").post(imgToimgVariations)

module.exports= router