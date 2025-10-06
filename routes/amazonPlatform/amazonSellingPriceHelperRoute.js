const express = require("express");
const {
  fetchAllCategories,
  fetchSubcategories,
  fetchGstPercent,
  fetchClosingFee,
  fetchReferralRate,
  fetchAmazonShippingFee,
  amazonSellingPriceCalc,
} = require("../../controllers/amazon/amazonAPI");
const router = express.Router();

// no params
router.route("/categories").get(fetchAllCategories);

// with query params: category
router.route("/subcategories").get(fetchSubcategories);

// with query params: category, subcategory
router.route("/gst-percent").get(fetchGstPercent);

//category, subcategory, price, fulfillmentType
router.route("/closing-fee").get(fetchClosingFee);

// category, subcategory, sellingPrice
router.route("/referral-rate").get(fetchReferralRate);

//mode, zone, weightKg
router.route("/shipping-fee").get(fetchAmazonShippingFee);

// seling price calculation route (POST)
// get
router.route("/calculate-selling-price").get(amazonSellingPriceCalc);

module.exports = router;

/* 

baseUrl + /amazon/helper

*no params* 
router.route("/categories").get(fetchAllCategories);

 *with query params: category*
router.route("/subcategories").get(fetchSubcategories);

 *with query params: category, subcategory*
router.route("/gst-percent").get(fetchGstPercent);

*category, subcategory, price, fulfillmentType*
router.route("/closing-fee").get(fetchClosingFee);

 *category, subcategory, sellingPrice*
router.route("/referral-rate").get(fetchReferralRate);

*mode, zone, weightKg*
router.route("/shipping-fee").get(fetchAmazonShippingFee);


*/
