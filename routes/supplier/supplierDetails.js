const express = require("express");
const { authentication } = require("../../middi/userAuth");
const {
  createSupplierDetails,
  getSupplierDetails,
  updateSupplierDetails,
} = require("../../controllers/supplier/supplierDetailsCtrl");

const router = express.Router();

router.route("/create").post(authentication, createSupplierDetails);
router.route("/update").put(authentication, updateSupplierDetails);
router.route("/get").get(authentication, getSupplierDetails);

module.exports = router;
