// controllers/supplierProductController.js

const SupplierProductModel = require("../../models/supplierModel/suppliersProductModel");
const {
  uploadProductImages,
  destroyProductImages,
} = require("../../utils/backgroundRemover");
const mongoose = require("mongoose");

function safeTrim(val) {
  if (val === undefined || val === null) return val;
  if (typeof val !== "string") return val;
  return val.trim();
}

// ------------------ CREATE ------------------
exports.createSupplierProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Auth Required" });

    const supplierId = req.params.supplierId;

    if (!supplierId || !mongoose.isValidObjectId(supplierId)) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide valid supplier Id" });
    }

    const userId = req.user._id;
    const body = req.body || {};

    // required fields
    const category = safeTrim(body.category);
    const subCategory = safeTrim(body.subCategory);
    const productName = safeTrim(body.productName);
    const description = safeTrim(body.description);
    const priceRange = safeTrim(body.priceRange);
    const moq = safeTrim(body.moq);
    const unit = safeTrim(body.unit) || "pcs";
    const brandName = safeTrim(body.brandName) || "";
    const tags = Array.isArray(body.tags)
      ? body.tags.map((t) => safeTrim(t)).filter(Boolean)
      : [];

    const validUnit = [
      "pcs",
      "kg",
      "gram",
      "ltr",
      "ml",
      "meter",
      "cm",
      "mm",
      "dozen",
      "box",
      "packet",
      "pair",
      "set",
      "bundle",
      "roll",
      "sheet",
      "unit",
      "piece",
      "bag",
      "bottle",
      "can",
    ];

    if (!validUnit.includes(unit))
      return res
        .status(400)
        .json({ status: false, message: `vaild Units are: ${validUnit}` });

    if (!category)
      return res
        .status(400)
        .json({ status: false, message: "category is required" });
    if (!subCategory)
      return res
        .status(400)
        .json({ status: false, message: "subCategory is required" });
    if (!productName)
      return res
        .status(400)
        .json({ status: false, message: "productName is required" });
    if (!description)
      return res
        .status(400)
        .json({ status: false, message: "description is required" });
    if (!priceRange)
      return res
        .status(400)
        .json({ status: false, message: "priceRange is required" });
    if (!moq)
      return res
        .status(400)
        .json({ status: false, message: "moq is required" });

    if (!req.files || !req.files.images)
      return res
        .status(400)
        .json({ status: false, message: "image is required" });

    let images = [];
    if (req.files && req.files.images) {
      if (Array.isArray(req.files.images)) images = req.files.images;
      else images = [req.files.images];
    }

    // upload images
    let imageDocs = [];
    if (images.length) {
      const folderName = `supplier_products/${String(userId)}`;
      imageDocs = await uploadProductImages(images, folderName);
    }

    const payload = {
      userId,
      supplier: supplierId,
      category,
      subCategory,
      productName,
      description,
      priceRange,
      moq,
      unit,
      image: imageDocs,
      brandName,
      tags,
      status: body.status ? safeTrim(body.status) : "active",
      isVerified:
        body.isVerified === undefined ? true : Boolean(body.isVerified),
    };

    const created = await SupplierProductModel.create(payload);

    return res.status(201).json({
      status: true,
      message: "Supplier product created successfully",
      data: created,
    });
  } catch (err) {
    console.error("createSupplierProducts error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ------------------ GET ALL (PAGINATION / SEARCH / SORT) ------------------
exports.getAllSupplierProducts = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;

    // query params
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit || "10", 10))
    );
    const skip = (page - 1) * limit;

    const search = safeTrim(req.query.search) || null;
    const supplierFilter =
      req.query.supplier && isValidObjectId(req.query.supplier)
        ? req.query.supplier
        : null;
    const categoryFilter = safeTrim(req.query.category) || null;
    const sortBy = safeTrim(req.query.sortBy) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // build filter
    const filter = { status: "active" };
    if (supplierFilter) filter.supplier = supplierFilter;
    if (categoryFilter) filter.category = categoryFilter;

    if (search) {
      // simple text search across productName, description, brandName, tags
      const regex = new RegExp(escapeForRegex(search), "i");
      filter.$or = [
        { productName: regex },
        { description: regex },
        { brandName: regex },
        { tags: regex },
      ];
    }

    // total count
    const total = await SupplierProductModel.countDocuments(filter);
    const products = await SupplierProductModel.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return res.status(200).json({
      status: true,
      message: "Products fetched",
      data: products,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllSupplierProducts error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// small helper used above to build regex safely
function escapeForRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ------------------ GET SINGLE ------------------
exports.getSupplierProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ status: false, message: "Invalid product id" });

    const product = await SupplierProductModel.findById(id).lean();
    if (!product)
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });

    return res
      .status(200)
      .json({ status: true, message: "Product fetched", data: product });
  } catch (err) {
    console.error("getSupplierProductById error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ------------------ UPDATE ------------------
exports.updateSupplierProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Auth Required" });

    const userId = req.user._id;
    const id = req.params.id;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ status: false, message: "Invalid product id" });

    const existing = await SupplierProductModel.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });

    if (String(existing.userId) !== String(userId)) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this product",
      });
    }

    const body = req.body || {};
    const updatePayload = {};

    // optional fields — trim if provided
    if (body.category !== undefined)
      updatePayload.category = safeTrim(body.category);
    if (body.subCategory !== undefined)
      updatePayload.subCategory = safeTrim(body.subCategory);
    if (body.productName !== undefined)
      updatePayload.productName = safeTrim(body.productName);
    if (body.description !== undefined)
      updatePayload.description = safeTrim(body.description);
    if (body.priceRange !== undefined)
      updatePayload.priceRange = safeTrim(body.priceRange);
    if (body.moq !== undefined) updatePayload.moq = safeTrim(body.moq);
    if (body.unit !== undefined) updatePayload.unit = safeTrim(body.unit);
    if (body.brandName !== undefined)
      updatePayload.brandName = safeTrim(body.brandName);
    if (Array.isArray(body.tags))
      updatePayload.tags = body.tags.map((t) => safeTrim(t)).filter(Boolean);
    if (body.status !== undefined) updatePayload.status = safeTrim(body.status);
    if (body.isVerified !== undefined)
      updatePayload.isVerified = Boolean(body.isVerified);
    // new image upload
    let newImages = [];

    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      // destroy old images first (if any)
      if (existing.image && existing.image.length) {
        try {
          await destroyProductImages(existing.image);
        } catch (e) {
          // log and continue; we still attempt new upload
          console.error("destroyProductImages error (update):", e);
        }
      }
      const folderName = `supplier_products/${String(userId)}`;
      newImages = await uploadProductImages(images, folderName);
      updatePayload.image = newImages;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields provided for update",
      });
    }

    const updated = await SupplierProductModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    );

    return res
      .status(200)
      .json({ status: true, message: "Product updated", data: updated });
  } catch (err) {
    console.error("updateSupplierProduct error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ------------------ DELETE ------------------
exports.deleteSupplierProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Auth Required" });

    const userId = req.user._id;
    const id = req.params.id;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ status: false, message: "Invalid product id" });

    const existing = await SupplierProductModel.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });

    // authorize: only owner can delete (adjust to your rules)
    if (String(existing.userId) !== String(userId)) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to delete this product",
      });
    }

    // destroy images if present
    if (existing.image && existing.image.length) {
      try {
        await destroyProductImages(existing.image);
      } catch (e) {
        console.error("destroyProductImages error (delete):", e);
        // continue deletion even if image destroy partially fails
      }
    }

    await SupplierProductModel.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteSupplierProduct error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};


// imageReplacerSupplierProduct - supports selective replace, full replace, reorder, move
exports.imageReplacerSupplierProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Auth Required" });

    const userId = req.user._id;
    const id = req.params.id;

    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ status: false, message: "Invalid product id" });

    const existing = await SupplierProductModel.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });

    if (String(existing.userId) !== String(userId)) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to modify images for this product",
      });
    }

    // Normalize uploaded files into array (if present)
    const uploadedFiles =
      req.files && req.files.images
        ? Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images]
        : [];

    // Parse optional body fields
    // 1) reorder: JSON array mapping new positions to old indexes, e.g. [2,0,1]
    let reorder = null;
    if (
      req.body.reorder !== undefined &&
      req.body.reorder !== null &&
      req.body.reorder !== ""
    ) {
      try {
        reorder =
          typeof req.body.reorder === "string"
            ? JSON.parse(req.body.reorder)
            : req.body.reorder;
      } catch (e) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Invalid reorder format (must be JSON array)",
          });
      }
      if (!Array.isArray(reorder)) {
        return res
          .status(400)
          .json({
            status: false,
            message: "reorder must be an array of indexes",
          });
      }
    }

    // 2) move: { from: num, to: num }
    let moveOp = null;
    if (
      req.body.move !== undefined &&
      req.body.move !== null &&
      req.body.move !== ""
    ) {
      try {
        moveOp =
          typeof req.body.move === "string"
            ? JSON.parse(req.body.move)
            : req.body.move;
      } catch (e) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Invalid move format (must be JSON object)",
          });
      }
      if (
        typeof moveOp !== "object" ||
        moveOp === null ||
        !Number.isInteger(moveOp.from) ||
        !Number.isInteger(moveOp.to)
      ) {
        return res
          .status(400)
          .json({
            status: false,
            message: "move must be { from: int, to: int }",
          });
      }
    }

    // 3) selective replace indexes: req.body.images (array)
    let indexesToReplace = null;
    if (
      req.body.images !== undefined &&
      req.body.images !== null &&
      req.body.images !== ""
    ) {
      try {
        indexesToReplace =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
      } catch (e) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid images indexes format" });
      }

      if (!Array.isArray(indexesToReplace)) {
        return res
          .status(400)
          .json({
            status: false,
            message: "images must be an array of indexes",
          });
      }
      if (
        indexesToReplace.some(
          (ix) => typeof ix !== "number" || !Number.isInteger(ix)
        )
      ) {
        return res
          .status(400)
          .json({
            status: false,
            message: "images indexes must be integer numbers",
          });
      }
    }

    // working copy of image array
    let imagesArray = Array.isArray(existing.image)
      ? existing.image.slice()
      : [];

    const maxIndex = imagesArray.length - 1;

    // ---------- REORDER or MOVE operations ----------
    if (reorder) {
      // validate reorder array is a permutation of existing indexes
      if (reorder.length !== imagesArray.length) {
        return res.status(400).json({
          status: false,
          message: `reorder length must equal existing images count (${imagesArray.length})`,
        });
      }
      // each value in reorder should be integer in [0, maxIndex] and unique
      const seen = new Set();
      for (const v of reorder) {
        if (!Number.isInteger(v) || v < 0 || v > maxIndex) {
          return res
            .status(400)
            .json({ status: false, message: `Invalid index in reorder: ${v}` });
        }
        if (seen.has(v)) {
          return res
            .status(400)
            .json({
              status: false,
              message: `Duplicate index in reorder: ${v}`,
            });
        }
        seen.add(v);
      }
      // apply reorder: newImages[i] = imagesArray[ reorder[i] ]
      const newImages = [];
      for (let i = 0; i < reorder.length; i++) {
        newImages[i] = imagesArray[reorder[i]];
      }
      imagesArray = newImages;
    } else if (moveOp) {
      // validate bounds
      const from = moveOp.from;
      const to = moveOp.to;
      if (from < 0 || from > maxIndex || to < 0 || to > maxIndex) {
        return res
          .status(400)
          .json({ status: false, message: "move from/to out of bounds" });
      }
      // perform move
      const item = imagesArray.splice(from, 1)[0]; // removes from
      imagesArray.splice(to, 0, item); // insert at to
    }

    // ---------- SELECTIVE REPLACE logic ----------
    if (indexesToReplace) {
      // must have uploadedFiles and lengths must match
      if (uploadedFiles.length === 0) {
        return res
          .status(400)
          .json({
            status: false,
            message: "No uploaded files provided to replace specified indexes",
          });
      }
      if (indexesToReplace.length !== uploadedFiles.length) {
        return res.status(400).json({
          status: false,
          message:
            "Number of uploaded files must match number of indexes to replace",
        });
      }

      // ensure target indexes within bounds of current imagesArray
      if (imagesArray.length === 0) {
        return res.status(400).json({
          status: false,
          message:
            "Product has no existing images to selectively replace. For full replace omit images indexes.",
        });
      }
      for (const ix of indexesToReplace) {
        if (ix < 0 || ix > imagesArray.length - 1) {
          return res.status(400).json({
            status: false,
            message: `Index ${ix} out of bounds (existing images count: ${imagesArray.length})`,
          });
        }
      }

      // upload new files first
      const folderName = `supplier_products/${String(userId)}`;
      let newImageDocs;
      try {
        newImageDocs = await uploadProductImages(uploadedFiles, folderName); // returns array
      } catch (e) {
        console.error("uploadProductImages error (selective):", e);
        return res
          .status(500)
          .json({ status: false, message: "Failed to upload new images" });
      }

      // collect old images to delete
      const toDelete = [];
      for (const ix of indexesToReplace) {
        const old = imagesArray[ix];
        if (old && old.public_id) toDelete.push(old);
      }

      // delete old images (best-effort)
      if (toDelete.length) {
        try {
          await destroyProductImages(toDelete);
        } catch (e) {
          console.error("destroyProductImages error (selective):", e);
          // continue
        }
      }

      // set new images on specified indexes (order preserved)
      for (let i = 0; i < indexesToReplace.length; i++) {
        const ix = indexesToReplace[i];
        imagesArray[ix] = newImageDocs[i];
      }

      // save and return
      existing.image = imagesArray;
      await existing.save();

      return res.status(200).json({
        status: true,
        message: "Product images replaced (selective) successfully",
        data: existing,
      });
    }

    // ---------- FULL REPLACE logic ----------
    if (!indexesToReplace && uploadedFiles.length > 0) {
      // full replace: upload new ones, delete old ones
      const folderName = `supplier_products/${String(userId)}`;

      let uploadedImageDocs;
      try {
        uploadedImageDocs = await uploadProductImages(
          uploadedFiles,
          folderName
        );
      } catch (e) {
        console.error("uploadProductImages error (full replace):", e);
        return res
          .status(500)
          .json({ status: false, message: "Failed to upload new images" });
      }

      // delete old images (best-effort)
      if (imagesArray.length) {
        try {
          await destroyProductImages(imagesArray);
        } catch (e) {
          console.error("destroyProductImages error (full replace):", e);
        }
      }

      existing.image = uploadedImageDocs;
      await existing.save();

      return res.status(200).json({
        status: true,
        message: "Product images fully replaced successfully",
        data: existing,
      });
    }

    // ---------- REORDER / MOVE only (no uploads) ----------
    if ((reorder || moveOp) && uploadedFiles.length === 0) {
      existing.image = imagesArray;
      await existing.save();
      return res.status(200).json({
        status: true,
        message: "Product images reordered/moved successfully",
        data: existing,
      });
    }

    // If we reach here: no valid operation was provided
    return res
      .status(400)
      .json({ status: false, message: "No valid image operation provided" });
  } catch (err) {
    console.error("imageReplacerSupplierProduct error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};
