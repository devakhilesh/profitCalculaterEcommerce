const axios = require("axios");
const { findFirstUrl } = require("../utils/imageEnhencer");
const {
  imageUrlToImageStoreCloudinary,
  deleteSingleImage,
} = require("../utils/backgroundRemover");
const { Readable } = require("stream");
const ImageEnhancerModel = require("../models/imageEnhencerModel");
const ARK_URL =
  "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
const ARK_KEY = process.env.ARK_API_KEY;
if (!ARK_KEY) console.warn("ARK_API_KEY not set in .env");

exports.imgToimgEnhancer = async (req, res) => {
  try {

    // console.log("=== imgToimgEnhancer called ===");
    // console.log("req.is(multipart):", req.is("multipart/form-data"));
    // console.log("req.headers['content-type']:", req.headers && req.headers['content-type']);
    // console.log("req.files (raw):", req.files);
    // console.log("req.body (raw):", req.body);


    const prompt =
      "Enhance the provided image to ultra-high definition, improving clarity, sharpness, color balance, and lighting while preserving natural details and realistic texture. Input image equal to enhanced Input image content will remain same";

    // Prefer uploaded file if provided
   let imageField = req.body?.image || null;

console.log("files", req.files)

    if (req.files && req.files.imageFile) {
      // express-fileupload gives us a file object
      const file = req.files.imageFile;
            console.log(file)

      // validate mimetype if desired
      if (!/^image\//.test(file.mimetype)) {
        return res
          .status(400)
          .json({ success: false, error: "Uploaded file is not an image." });
      }
      // convert buffer to base64 data URL (this is safe memory-wise for moderate file sizes)
      const b64 = file.data.toString("base64");
      imageField = `data:${file.mimetype};base64,${b64}`;
    }

    // fallback default image url if none provided
    if (!imageField) {
      imageField =
        "https://ark-doc.tos-ap-southeast-1.bytepluses.com/doc_image/seedream4_imageToimage.png";
    }

    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      image: imageField, // either a public URL or a base64 data URL
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: false,
    };

    const headers = { "Content-Type": "application/json" };
    if (ARK_KEY) headers["Authorization"] = `Bearer ${ARK_KEY}`;

    const arkResp = await axios.post(ARK_URL, payload, {
      headers,
      timeout: 120000,
    });

    // console.log("arkResp:=\n\n", arkResp.data);

    const maybeUrl = findFirstUrl(arkResp.data) || null;

    const resp = {
      prompt,
      //   imageProvided: imageField.startsWith("data:")
      //     ? "[base64-data]"
      //     : imageField,
      extractedUrl: maybeUrl,
      raw: arkResp.data,
    };

    if (!maybeUrl) {
      return res.status(400).json({
        status: false,
        message:
          "Something wents wrong while Trying to enhance this Image Try After Sometime",
      });
    }

    return res.json({
      status: true,
      message: "Enhenced Successfully",
      data: resp,
    });

    // const cloudinaryStore = await imageUrlToImageStoreCloudinary(
    //   resp.extractedUrl,
    //   "EnhancedImage"
    // );

    // if (cloudinaryStore.status) {
    //   console.log("stored succesfully");
    //   //   console.log(cloudinaryStore.data);

    //   data.userId = userId;
    //   data.featureType = "Image Enhancer";
    //   data.enhanced_img = cloudinaryStore.data;

    //   const save = await ImageEnhancerModel.create(data);

    //   console.log("storedData :", save);
    // } else {
    //   console.log("there is issue facing from cloudinary!!!");
    //   console.log("error Cloudinary\n\n:", cloudinaryStore);
    // }
    // will preform some db action actions ...
  } catch (err) {
    const status = err.response ? err.response.status : 500;
    const body = err.response ? err.response.data : err.message;
    console.error("Image-to-image generation error:", body);
    return res.status(status).json({
      success: false,
      error: typeof body === "object" ? body : String(body),
    });
  }
};

// Get all background removed images for a user
exports.getAllEnhancedImages = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    let userId = req.user._id;

    const images = await ImageEnhancerModel.find({ userId: userId });

    return res.status(200).json({
      status: true,
      message: "Images retrieved successfully",
      data: images,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// Delete a background removed image by ID
exports.deleteEnhancedImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    let userId = req.user._id;
    const imageId = req.params.imageId;
    if (!imageId) {
      return res
        .status(400)
        .json({ status: false, message: "Image ID is required" });
    }
    const image = await ImageEnhancerModel.findOneAndDelete({
      _id: imageId,
      userId: userId,
    });

    if (!image) {
      return res
        .status(404)
        .json({ status: false, message: "Image not found" });
    }

    const check1 = await deleteSingleImage(image.original_img);

    console.log("check1", check1);

    // await image.remove();

    return res.status(200).json({
      status: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
