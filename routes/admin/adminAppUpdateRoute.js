const express = require("express");
const { authentication, adminAuthorization } = require("../../middi/userAuth");
const {
  createLatestVersionAdmin,
  getLatestVersionAdmin,
} = require("../../controllers/admin/adminAppUpdateCtrl");

const router = express.Router();

router
  .route("/createUpdate")
  .post(authentication, adminAuthorization, createLatestVersionAdmin);

router
  .route("/get")
  .get(authentication, adminAuthorization, getLatestVersionAdmin);

module.exports = router;

/* 

Admin app Update 


_*baseUrl + /admin/app/update*_

*create or Update*

Body: latestVersion(string), downloadLink(string),disclaimer(String)

/createUpdate


*get latest version*

/get



*/
