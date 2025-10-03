const {
  getAllCategories,
  getSubcategories,
  getGstPercent,
  getClosingFee,
  getReferralRate,
  getAmazonShippingFee,
  calculateAmazonSellingPriceByCostPrice,
} = require("./amazonHelperFunction");

// =================== Get All Categories ===================
exports.fetchAllCategories = async (req, res) => {
  try {
    const data = await getAllCategories();
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Get Subcategories ===================
exports.fetchSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ status: false, message: "category is required" });
    }

    const data = await getSubcategories(category);
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Get GST Percent ===================
exports.fetchGstPercent = async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    if (!category || !subcategory) {
      return res.status(400).json({
        status: false,
        message: "category and subcategory are required",
      });
    }

    const data = await getGstPercent(category, subcategory);
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Get Closing Fee ===================
exports.fetchClosingFee = async (req, res) => {
  try {
    const { category, subcategory, price, fulfillmentType } = req.query;

    if (!price) {
      return res
        .status(400)
        .json({ status: false, message: "price is required" });
    }

    const data = await getClosingFee(category, subcategory, {
      price: Number(price),
      fulfillmentType,
    });

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Get Referral Rate ===================
exports.fetchReferralRate = async (req, res) => {
  try {
    const { category, subcategory, sellingPrice } = req.query;
    req.query;

    if (!category || !subcategory || !sellingPrice) {
      return res.status(400).json({
        status: false,
        message: "category, subcategory and sellingPrice are required",
      });
    }

    const data = await getReferralRate(
      category,
      subcategory,
      Number(sellingPrice),
      {}
    );

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Get Amazon Shipping Fee ===================
exports.fetchAmazonShippingFee = async (req, res) => {
  try {
    const { mode, zone, weightKg } = req.query;

    if (!mode || !zone || !weightKg) {
      return res.status(400).json({
        status: false,
        message: "mode, zone and weightKg are required",
      });
    }

    if (isNaN(Number(weightKg)) || Number(weightKg) <= 0) {
      return res
        .status(400)
        .json({ status: false, message: "weightKg must be a positive number" });
    }

    const data = await getAmazonShippingFee(mode, zone, Number(weightKg));
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== Calculate Amazon Selling Price ===================
exports.amazonSellingPriceCalc = async (req, res) => {
  try {
    const {
      costPrice,
      profitType,
      profitValue,
      category,
      subcategory,
      weightGram,
      mode,
      zone,
      gstPercent,
      guessSPInput,
    } = req.query;

    // Call your function with parsed values
    const result = await calculateAmazonSellingPriceByCostPrice(
      Number(costPrice),
      Number(profitValue),
      category,
      subcategory,
      Number(weightGram),
      mode,
      zone,
      Number(gstPercent),
      Number(guessSPInput)
    );

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        error: result.error || "Calculation failed",
      });
    }

    // Response with proper field names
    res.json({
      success: true,
      // input: result.input,
      breakdown: {
        referralFee: result.result.referral,
        closingFee: result.result.closingFee,
        shippingFee: result.result.shippingFee,
        gstAmount: result.result.gst,
        totalCost: result.result.totalCost,
        desiredProfit: result.result.desiredProfit,
      },
      sellingPrice: result.result.sellingPrice,
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
};
