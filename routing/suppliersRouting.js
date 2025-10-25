const express = require("express");

const sup = express();
const suppliersDetailsRoute = require("../routes/supplier/supplierDetails");

sup.use("/suppliers/details", suppliersDetailsRoute);

module.exports = sup;
