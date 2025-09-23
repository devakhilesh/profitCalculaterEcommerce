const express = require("express");
const { authentication, adminAuthorization } = require("../middi/userAuth");
const {
  createplateform,
  updatePlateform,
  deletePlateform,
  getAll,
} = require("../controllers/platformCtrl");

const router = express.Router();

router
  .route("/create")
  .post(authentication, adminAuthorization, createplateform);

router
  .route("/update/:platformId")
  .put(authentication, adminAuthorization, updatePlateform);

router
  .route("/delete/:platformId")
  .delete(authentication, adminAuthorization, deletePlateform);

router.route("/getAll").get(authentication, getAll);

module.exports = router;
