const axios = require("axios");
const {
  imageUrlToImageStoreCloudinary,
} = require("../../utils/backgroundRemover");
const userAIWalletModel = require("../../models/userModel/userWalletModel");

const ARK_URL =
  "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";

const ARK_KEY = process.env.ARK_API_KEY;
if (!ARK_KEY) console.warn("ARK_API_KEY not set in .env");

exports.imgToimgVariations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ status: false, message: "Re -LogIn" });
    }

    const wallet = await userAIWalletModel.findOne({ userId: req.user._id });

    if (!wallet) {
      return res
        .status(404)
        .json({ status: false, message: "Not Found Wallet" });
    }

    if (wallet.credit < 2) {
      return res.status(400).json({
        status: false,
        message:
          "Insufficient Balance Recharge Now wallet should have more than 2 credit to use this service",
      });
    }

    let imageField = req.body?.image || null;

    if (req.files && req.files.imageFile) {
      const file = req.files.imageFile;

      console.log("file", file);
      if (!/^image\//.test(file.mimetype)) {
        return res
          .status(400)
          .json({ success: false, error: "Uploaded file is not an image." });
      }
      const b64 = file.data.toString("base64");
      imageField = `data:${file.mimetype};base64,${b64}`;
    }

    if (!imageField) {
      imageField =
        "https://ark-doc.tos-ap-southeast-1.bytepluses.com/doc_image/seedream4_imageToimage.png";
    }

    // Prompt: ask the model to produce 2 realistic variations of the provided image

    const prompt =
      "Produce 2 distinct, photorealistic variations of the provided image that look like they were taken from different camera angles of the same scene. Keep the exact same subject, clothes, props and background context, but shift the camera viewpoint for each output (for example: a three-quarter front view and a slight low-angle view). Preserve facial/subject identity and main composition, keep consistent lighting and color palette, render natural shadows, depth and realistic textures. Output high-resolution images suitable for display.";

    const payload = {
      model: "seedream-4-0-250828",
      prompt,
      image: Array.isArray(imageField) ? imageField : [imageField],
      sequential_image_generation: "auto",
      sequential_image_generation_options: {
        max_images: 2,
      },
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

    console.log("arkResp :=\n\n", arkResp.data);

    const extractUrlsFromResponse = (resp) => {
      try {
        if (!resp) return [];

        if (Array.isArray(resp.data) && resp.data.length) {
          const urls = resp.data
            .map((it) => (it && it.url ? it.url : null))
            .filter(Boolean);
          if (urls.length) return urls;
        }

        if (resp.data && Array.isArray(resp.data.images)) {
          const urls = resp.data.images
            .map((it) =>
              it && it.url ? it.url : typeof it === "string" ? it : null
            )
            .filter(Boolean);
          if (urls.length) return urls;
        }

        if (resp.data && typeof resp.data === "object") {
          const found = [];
          const stack = [resp.data];
          while (stack.length) {
            const node = stack.pop();
            if (!node || typeof node !== "object") continue;
            for (const k of Object.keys(node)) {
              const v = node[k];
              if (
                k === "url" &&
                typeof v === "string" &&
                v.startsWith("http")
              ) {
                found.push(v);
              } else if (v && typeof v === "object") {
                stack.push(v);
              }
            }
          }
          if (found.length) return found;
        }

        const s = JSON.stringify(resp);
        const urlRegex = /https?:\/\/[^\s\"']+/g;
        const matches = s.match(urlRegex) || [];
        const uniq = [...new Set(matches)];
        return uniq;
      } catch (e) {
        return [];
      }
    };

    const allUrls = extractUrlsFromResponse(arkResp.data);
    const extracted = allUrls.slice(0, 2);

    if (!extracted.length) {
      return res.status(500).json({
        success: false,
        error: "No image URLs found in ARK response.",
        raw: arkResp.data,
      });
    }

    // update wallet credit by -2 for each call
    const updatedWallet = await userAIWalletModel.findOneAndUpdate(
      { userId: req.user._id, credit: { $gte: 2 } },
      { $inc: { credit: -2 } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(409).json({
        status: false,
        message:
          "Unable to deduct credit: insufficient balance (race condition). Please try again after recharge or try once more.",
      });
    }

    const resp = {
      prompt,
      extractedUrls: extracted,
      raw: arkResp.data,
    };

    // wallet diduction logic

    return res.json({
      status: true,
      message: "Generated variations successfully",
      data: resp,
    });
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

// save selected image //
/* exports.imgToimgVariations = async (req, res) => {
  try {
    const data = req.body;
    // const userId = req.user._id; //68d54820adc63cdbb0c9bb4b

    const prompt =
      "Enhance the provided image to ultra-high definition, improving clarity, sharpness, color balance, and lighting while preserving natural details and realistic texture.";

    // Prefer uploaded file if provided
    let imageField = req.body.image || req.query.image || null;

    if (req.files && req.files.imageFile) {
      // express-fileupload gives us a file object
      const file = req.files.imageFile;
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

    console.log("arkResp:=\n\n", arkResp.data);

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

    res.json({
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

  } catch (err) {
    const status = err.response ? err.response.status : 500;
    const body = err.response ? err.response.data : err.message;
    console.error("Image-to-image generation error:", body);
    return res.status(status).json({
      success: false,
      error: typeof body === "object" ? body : String(body),
    });
  }
}; */
