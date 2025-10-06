const express = require("express")


const admin = express()

const adminSubscription = require("../routes/admin/subcriptionPlansRoute")

admin.use("/admin/subscription", adminSubscription)



module.exports = admin