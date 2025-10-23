const express = require("express")


const admin = express()

const adminSubscription = require("../routes/admin/subcriptionPlansRoute")

// app Update check Admin 
const appUpdateAdmin = require("../routes/admin/adminAppUpdateRoute")

// ai recharge Route 

const aiRechargeRoute = require("../routes/admin/adminAiRechargeSubsRoute")

admin.use("/admin/subscription", adminSubscription)

admin.use("/admin/app/update", appUpdateAdmin)

admin.use("/admin/aiRecharge", aiRechargeRoute)

module.exports = admin