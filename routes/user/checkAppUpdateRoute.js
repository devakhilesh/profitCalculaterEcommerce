const express = require("express");


const { userCheckVersion } = require("../../controllers/admin/adminAppUpdateCtrl");
const { authentication } = require("../../middi/userAuth");

const router = express.Router();

router.route("/get").get(authentication, userCheckVersion);

module.exports = router;




/* 
*baseUrl+/app/update*

*check for update notice*
method:Get

*url: +/get*

*/