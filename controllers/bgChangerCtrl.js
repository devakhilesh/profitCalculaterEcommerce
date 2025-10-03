const {
  uploadSingleImageBackgroundChanger,
  deleteSingleImage,
} = require("../utils/backgroundRemover");

const BgChangerModel = require("../models/bgChangerModel");

// Upload & replace background
exports.replaceBackground = async (req, res) => {
  try {
    // auth check (you mentioned req.user exists)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const userId = req.user._id;

    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ status: false, message: "No image uploaded" });
    }

    // dynamic prompt: from body or query
    const prompt = req.body.prompt || req.query.prompt || "";
    const folder = req.body.folder || req.query.folder || "backgroundChanger";

    const image = req.files.image;

    // upload + generate replaced image using prompt
    const uploadRes = await uploadSingleImageBackgroundChanger(
      image,
      folder,
      prompt
    );

    if (!uploadRes || uploadRes.status === false) {
      return res.status(400).json({
        status: false,
        message: uploadRes.message || "Upload failed",
        error: uploadRes.error,
      });
    }

    // prepare DB doc
    const data = {
      userId,
      original_img: {
        public_id: uploadRes.data.original_public_id,
        url: uploadRes.data.original_url,
      },
      replaced_img: {
        public_id: uploadRes.data.replaced_public_id,
        url: uploadRes.data.replaced_url,
      },
      prompt: prompt,
    };

    const saved = await BgChangerModel.create(data);

    return res.status(201).json({
      status: true,
      message: "Background replaced and saved",
      data: saved,
    });
  } catch (err) {
    console.error("replaceBackground error:", err);
    return res
      .status(500)
      .json({ status: false, message: err.message || "Internal Server Error" });
  }
};

// List all replaced images for a user
exports.getAllReplacedImages = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Unauthorized" });
    const userId = req.user._id;

    const items = await BgChangerModel.find({ userId }).sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ status: true, message: "Retrieved", data: items });
  } catch (err) {
    console.error("getAllReplacedImages error:", err);
    return res
      .status(500)
      .json({ status: false, message: err.message || "Internal Server Error" });
  }
};

// Delete replaced image + cloudinary assets
exports.deleteReplacedImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ status: false, message: "Unauthorized" });
    const userId = req.user._id;
    const imageId = req.params.imageId;
    if (!imageId)
      return res.status(400).json({ status: false, message: "imageId required" });

    const doc = await BgChangerModel.findOneAndDelete({ _id: imageId, userId });
    if (!doc)
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });

    // delete original & replaced images
    const d1 = await deleteSingleImage(doc.original_img).catch((e) => ({
      status: false,
      message: e.message,
    }));
    const d2 = await deleteSingleImage(doc.replaced_img).catch((e) => ({
      status: false,
      message: e.message,
    }));

    return res.status(200).json({
      status: true,
      message: "Deleted successfully",
      //   cloudinaryDelete: { original: d1, replaced: d2 },
    });
  } catch (err) {
    console.error("deleteReplacedImage error:", err);
    return res
      .status(500)
      .json({ status: false, message: err.message || "Internal Server Error" });
  }
};
