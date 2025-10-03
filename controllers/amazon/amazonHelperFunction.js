const { amazonClosingFee } = require("../../amazonClosingFee");
const { amazonFeesData } = require("../../amazonData");
const { amazonShippingFee } = require("../../amazonShippingData");

// ---------------- Helper utilities ----------------
function normalizeText(t) {
  return String(t || "")
    .trim()
    .toLowerCase();
}

function priceMatchesSlab(price, slab) {
  const min =
    typeof slab.min === "number" ? slab.min : Number.NEGATIVE_INFINITY;
  const max =
    typeof slab.max === "number" ? slab.max : Number.POSITIVE_INFINITY;
  return price >= min && price <= max;
}

function findCategoryObj(categoryInput) {
  if (!categoryInput) return null;
  const q = normalizeText(categoryInput);
  // direct match on id
  const byId = amazonFeesData.categories.find(
    (c) => normalizeText(c.category_id) === q
  );
  if (byId) return byId;
  // match on category_name exact or contains
  const byNameExact = amazonFeesData.categories.find(
    (c) => normalizeText(c.category_name) === q
  );
  if (byNameExact) return byNameExact;
  const byNameContains = amazonFeesData.categories.find((c) =>
    normalizeText(c.category_name).includes(q)
  );
  if (byNameContains) return byNameContains;
  // fallback: try token match (words)
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length) {
    const score = amazonFeesData.categories
      .map((c) => {
        const name = normalizeText(c.category_name);
        const matches = tokens.reduce(
          (acc, tk) => acc + (name.includes(tk) ? 1 : 0),
          0
        );
        return { c, matches };
      })
      .sort((a, b) => b.matches - a.matches);
    if (score[0] && score[0].matches > 0) return score[0].c;
  }
  return null;
}

function findSubcategoryObj(catObj, subcategoryInput) {
  if (!catObj || !Array.isArray(catObj.subcategories) || !subcategoryInput)
    return null;
  const q = normalizeText(subcategoryInput);
  // exact / id-like match
  let found = catObj.subcategories.find((s) => normalizeText(s.name) === q);
  if (found) return found;
  // contains
  found = catObj.subcategories.find((s) => normalizeText(s.name).includes(q));
  if (found) return found;
  // try token scoring
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length) {
    const score = catObj.subcategories
      .map((s) => {
        const name = normalizeText(s.name);
        const matches = tokens.reduce(
          (acc, tk) => acc + (name.includes(tk) ? 1 : 0),
          0
        );
        return { s, matches };
      })
      .sort((a, b) => b.matches - a.matches);
    if (score[0] && score[0].matches > 0) return score[0].s;
  }
  return null;
}

// ----------------- 1. getAllCategories -----------------
async function getAllCategories() {
  try {
    const list = amazonFeesData.categories.map((c) => ({
      category_id: c.category_id,
      category_name: c.category_name,
    }));
    return { ok: true, categories: list };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ----------------- 2. getSubcategories(category) -----------------
async function getSubcategories(categoryInput) {
  try {
    const cat = findCategoryObj(categoryInput);
    if (!cat) return { ok: false, error: "Category not found" };
    const list = (cat.subcategories || []).map((s) => ({
      name: s.name,
      gst_percent: s.gst_percent,
    }));
    return {
      ok: true,
      category_id: cat.category_id,
      category_name: cat.category_name,
      subcategories: list,
    };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ----------------- 3. getGstPercent(category, subcategory) -----------------
async function getGstPercent(categoryInput, subcategoryInput) {
  try {
    const cat = findCategoryObj(categoryInput);
    if (!cat) return { ok: false, error: "Category not found" };
    const sub = findSubcategoryObj(cat, subcategoryInput);
    if (!sub) return { ok: false, error: "Subcategory not found" };
    return {
      ok: true,
      gst_percent: typeof sub.gst_percent === "number" ? sub.gst_percent : null,
    };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ----------------- utility: compute fixed closing fee suggestions -----------------
function computeClosingFeesForPrice(price) {
  const out = {};
  const fixed = amazonClosingFee.fixedClosingFee || {};

  Object.keys(fixed).forEach((key) => {
    const val = fixed[key];
    if (Array.isArray(val)) {
      const slab = val.find((s) => priceMatchesSlab(price, s));
      out[key] = slab ? slab.fee : null;
    } else if (typeof val === "object" && val !== null) {
      // selfShip has nested arrays like books / allExceptBooks
      out[key] = {};
      Object.keys(val).forEach((subkey) => {
        const arr = val[subkey];
        const slab = Array.isArray(arr)
          ? arr.find((s) => priceMatchesSlab(price, s))
          : null;
        out[key][subkey] = slab ? slab.fee : null;
      });
    } else {
      out[key] = null;
    }
  });

  return out;
}

// ----------------- 4. getClosingFee(category, subcategory, options) -----------------
// need to modify  with new data structure
/* 
async function getClosingFee(categoryInput, subcategoryInput, options = {}) {
  try {
    const cat = findCategoryObj(categoryInput);
    const sub = cat ? findSubcategoryObj(cat, subcategoryInput) : null;

    const priceHint =
      options && typeof options.price === "number" ? options.price : null;

    if (typeof priceHint === "number") {
      const allFees = computeClosingFeesForPrice(priceHint);
      if (options.fulfillmentType) {
        const ft = options.fulfillmentType;
        if (ft === "selfShip") {
          const st =
            options.selfShipType || subcategoryInput === "Books"
              ? "books"
              : "allExceptBooks";
          return {
            ok: true,
            fulfillmentType: ft,
            selfShipType: st,
            fee: allFees.selfShip ? allFees.selfShip[st] : null,
          };
        }
        return { ok: true, fulfillmentType: ft, fee: allFees[ft] };
      }
      // return all suggestions
      return { ok: true, fees_for_price: allFees };
    }
    return { ok: true, fixedClosingFeeData: amazonClosingFee.fixedClosingFee };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

 */
// ----------------- 4. getClosingFee(category, subcategory, options) -----------------
async function getClosingFee(categoryInput, subcategoryInput, options = {}) {
  try {
    const cat = findCategoryObj(categoryInput);
    const sub = cat ? findSubcategoryObj(cat, subcategoryInput) : null;

    const priceHint =
      options && typeof options.price === "number" ? options.price : null;

    if (typeof priceHint === "number") {
      const allFees = computeClosingFeesForPrice(priceHint);

      if (options.fulfillmentType) {
        const ft = options.fulfillmentType;

        // Special handling for selfShip (books vs others)
        if (ft === "selfShip") {
          const isBook =
            normalizeText(subcategoryInput).includes("book") ||
            normalizeText(cat?.category_name).includes("book");

          const st =
            options.selfShipType || (isBook ? "books" : "allExceptBooks");

          return {
            ok: true,
            fulfillmentType: ft,
            selfShipType: st,
            fee: allFees.selfShip ? allFees.selfShip[st] : null,
          };
        }

        // For other fulfillment types (fba, easyShip, sellerFlex)
        return {
          ok: true,
          fulfillmentType: ft,
          fee: allFees[ft] || null,
        };
      }

      // Return all slabs if fulfillmentType not specified
      return { ok: true, fees_for_price: allFees };
    }

    // No price provided → return entire config
    return { ok: true, fixedClosingFeeData: amazonClosingFee.fixedClosingFee };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ----------------- 5. getReferralRate(category, subcategory, sellingPrice, options) -----------------

async function getReferralRate(
  categoryInput,
  subcategoryInput,
  sellingPrice,
  options = {}
) {
  try {
    if (
      typeof sellingPrice !== "number" ||
      Number.isNaN(sellingPrice) ||
      sellingPrice < 0
    ) {
      return { ok: false, error: "Invalid sellingPrice" };
    }

    const cat = findCategoryObj(categoryInput);
    if (!cat) return { ok: false, error: "Category not found" };
    const sub = findSubcategoryObj(cat, subcategoryInput);
    if (!sub) return { ok: false, error: "Subcategory not found" };

    const slabs = Array.isArray(sub.referral_slabs) ? sub.referral_slabs : [];
    // find matching slab
    const slab = slabs.find((s) => priceMatchesSlab(sellingPrice, s)) || null;
    const referral_percent = slab
      ? typeof slab.fee_percent === "number"
        ? slab.fee_percent
        : null
      : null;
    const referralAmount =
      referral_percent !== null
        ? (sellingPrice * referral_percent) / 100
        : null;

    const result = {
      ok: true,
      category_id: cat.category_id,
      category_name: cat.category_name,
      subcategory_name: sub.name,
      gst_percent: typeof sub.gst_percent === "number" ? sub.gst_percent : null,
      selling_price: sellingPrice,
      referral_percent,
      referral_amount: referralAmount,
    };

    // include closing fee suggestions if requested
    if (options.includeClosingFee) {
      const closingInfo = computeClosingFeesForPrice(sellingPrice);
      if (options.fulfillmentType) {
        if (options.fulfillmentType === "selfShip") {
          const st =
            options.selfShipType ||
            (normalizeText(cat.category_name).includes("book")
              ? "books"
              : "allExceptBooks");
          result.closing_fee = {
            fulfillmentType: "selfShip",
            selfShipType: st,
            fee: closingInfo.selfShip ? closingInfo.selfShip[st] : null,
          };
        } else {
          result.closing_fee = {
            fulfillmentType: options.fulfillmentType,
            fee: closingInfo[options.fulfillmentType],
          };
        }
      } else {
        result.closing_fee_suggestions = closingInfo;
      }
    }

    return result;
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

//========= Shipping Calculation ====

// example mode will be
//  (
// fba
//  easyShip
//  selfShip
//  sellerFlex
//  )

// zone
// (
// local
// regional
// national
// )

async function getAmazonShippingFee(mode, zone, weightKg) {
  // Handle self-ship case
  if (mode === "selfShip") {
    return {
      fee: 0,
      //   note: amazonShippingFee.selfShip.note
    };
  }

  const slabs = amazonShippingFee[mode]?.[zone];
  if (!slabs) {
    throw new Error(`Invalid mode (${mode}) or zone (${zone})`);
  }

  // Find matching slab
  for (let slab of slabs) {
    if (slab.maxKg === null) {
      // Above highest slab -> calculate base + extra
      const extraWeight = Math.max(0, weightKg - slab.minKg);
      const extraFee = Math.ceil(extraWeight) * slab.extraPerKg;
      return {
        fee: slab.base + extraFee,
        // base: slab.base,
        // extraFee
      };
    }

    if (weightKg >= slab.minKg && weightKg <= slab.maxKg) {
      return { fee: slab.fee };
    }
  }

  throw new Error("No matching slab found for given weight");
}

async function calculateAmazonSellingPriceByCostPrice(
  profitValue, // number (if percent, it's %)
  category, // category name string
  subcategory, // subcategory display name or id
  weightGram, // grams
  mode, // "fba"|"easyShip"|"selfShip"|"sellerFlex"
  zone, // "local"|"regional"|"national"
  gstPercent,
  guessSPInput
) {
  try {

    if (!category || !subcategory) return { ok: false, error: "category and subcategory are required" };
    if (!mode || !zone) return { ok: false, error: "mode and zone are required" };

    const weightKg = Math.max(0.001, Number(weightGram || 0) / 1000);

    // gst lookup (await)
    let gstPct = Number(gstPercent || 0);
    if (!gstPct) {
      try {
        const gstRes = await getGstPercent(category, subcategory);
        if (gstRes && gstRes.ok && typeof gstRes.gst_percent === "number") {
          gstPct = gstRes.gst_percent;
        } else {
          gstPct = 18;
        }
      } catch (err) {
        console.error("GST lookup error:", err);
        gstPct = 18;
      }
    }

    // desired profit flat
    let desiredProfitFlat = Number(profitValue) || 0;

    if (desiredProfitFlat < 0) desiredProfitFlat = 0;

    // guess sanity: if user didn't provide good guess, set a safe one
    guessSPInput = Number(guessSPInput);

    if (!isNaN(guessSPInput)) {
      return { ok: false, error: "Invalid guessSPInput" };
    }
      

    let guessSP = guessSPInput;
    let lastSP = guessSP;
    const maxIter = 50;
    const tolerance = 0.01;

    for (let i = 0; i < maxIter; i++) {
      // await referral
      const ref = await getReferralRate(category, subcategory, guessSP, { includeClosingFee: false }).catch(e => ({ ok:false, error: e.message || String(e) }));
      const referral_amount = ref && ref.ok ? Number(ref.referral_amount || 0) : 0;

      // await closing
      const closingOptions = { price: guessSP, fulfillmentType: mode };
      const closing = await getClosingFee(category, subcategory, closingOptions).catch(e => ({ ok:false, error: e.message || String(e) }));
      const closingFee = closing && (closing.fee || (closing.fees_for_price ? 0 : 0)) ? Number(closing.fee || 0) : 0;

      // await shipping
      const ship = await getAmazonShippingFee(mode, zone, weightKg).catch(e => ({ ok:false, error: e.message || String(e), fee:0 }));
      const shippingFee = ship && typeof ship.fee === "number" ? Number(ship.fee) : 0;

      const feesBeforeGst = referral_amount + closingFee + shippingFee;
      const gstAmount = (feesBeforeGst * gstPct) / 100;

      const totalCostToCover = CP + feesBeforeGst + gstAmount + desiredProfitFlat;
      const newSP = totalCostToCover;

      const diff = Math.abs(newSP - guessSP);
      guessSP = newSP;
      lastSP = newSP;

      if (diff < tolerance) {
        // converged
        // console.log(`Converged after ${i+1} iterations`);
        break;
      }
    }

    // final breakdown (await final calls)
    const finalRef = await getReferralRate(category, subcategory, lastSP, { includeClosingFee: false }).catch(e => ({ ok:false, error: e.message || String(e) }));
    const finalReferral = finalRef && finalRef.ok ? Number(finalRef.referral_amount || 0) : 0;

    const finalClosing = await getClosingFee(category, subcategory, { price: lastSP, fulfillmentType: mode }).catch(e => ({ ok:false, error: e.message || String(e) }));
    const finalClosingFee = finalClosing && typeof finalClosing.fee === "number" ? Number(finalClosing.fee) : 0;

    const finalShip = await getAmazonShippingFee(mode, zone, weightKg).catch(e => ({ ok:false, error: e.message || String(e), fee:0 }));
    const finalShippingFee = finalShip && typeof finalShip.fee === "number" ? Number(finalShip.fee) : 0;

    const feesBeforeGst = finalReferral + finalClosingFee + finalShippingFee;
    const finalGst = (feesBeforeGst * gstPct) / 100;
    const totalCost = CP + feesBeforeGst + finalGst;
    const profit = lastSP - totalCost;

    return {
      ok: true,
      // input: { CP, desiredProfitFlat, profitType, profitValue, category, subcategory, weightKg, mode, zone, gstPct },
      result: {
        referral: Number(finalReferral.toFixed(2)),
        closingFee: Number(finalClosingFee.toFixed(2)),
        shippingFee: Number(finalShippingFee.toFixed(2)),
        gst: Number(finalGst.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        desiredProfit: Number(desiredProfitFlat.toFixed(2)),
        sellingPrice: Number(lastSP.toFixed(2)),
        profit: Number(profit.toFixed(2))
      }
    };
  } catch (err) {
    console.error("Calculation error:", err);
    return { ok: false, error: err.message || String(err) };
  }
}


// ----------------- Exports (for Node) -----------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getAllCategories,
    getSubcategories,
    getGstPercent,
    getClosingFee,
    getReferralRate,
    getAmazonShippingFee,
    calculateAmazonSellingPriceByCostPrice,
  };
}

// console.log("All Categories: \n\n", getAllCategories());
// console.log(
//   "Subcategories for Electronics: \n\n",
//   getSubcategories("Baby Products, Toys & Education")
// );
// console.log(
//   "GST Percent for Electronics - Headphones: \n\n",
//   getGstPercent("Electronics", "Headphones")
// );

// console.log(
//   "Closing Fee for Baby Products - Baby Strollers: \n\n",
//   getClosingFee("Baby Products, Toys & Education", "Baby Strollers", {
//     price: 550,
//     fulfillmentType: "sellerFlex",
//   })
// );

// console.log(
//   "Referral Rate for Electronics - Headphones: \n\n",
//   getReferralRate("Books, Music, Movies, Video Games, Entertainment", "Musical Instruments - Keyboards", 500, {})
// )

// console.log(
//   "Shipping Fee: \n\n",
//   getAmazonShippingFee("easyShip", "national", 2)
// );

// =>
/* (async () => {
  const out = await calculateAmazonSellingPriceByCostPrice(
    500, "flat", 100,
    "Books, Music, Movies, Video Games, Entertainment",
    "Musical Instruments - Keyboards",
    300, "easyShip", "national", 18, 1000
  );
  console.log(out);
})(); */


// Related portions of node_modules/lodash/_reTrim.js:

