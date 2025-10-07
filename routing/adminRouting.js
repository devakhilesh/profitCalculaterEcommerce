const express = require("express")


const admin = express()

const adminSubscription = require("../routes/admin/subcriptionPlansRoute")

// app Update check Admin 
const appUpdateAdmin = require("../routes/admin/adminAppUpdateRoute")


admin.use("/admin/subscription", adminSubscription)


admin.use("/admin/app/update", appUpdateAdmin)


module.exports = admin