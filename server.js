require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(express.json());

app.use(cors());

// app.use(
//   fileUpload({
//     limits: { fileSize: 9 * 1024 * 1024 },
//   })
// );

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
    abortOnLimit: true,
    createParentPath: true,
  })
);

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET,
});

// connect to mongo db
mongoose
  .connect(process.env.MONGODB_URL_LOCAL)
  .then(() => {
    console.log(`mongo db connected successfully`);
  })

  .catch((err) => {
    console.log(err.message);
  });

const path = require("path");

const fs = require("fs");

app.get("/", async (req, res) => {
  return res.send("app is workring completely fine");
});

const ARK_URL =
  "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
const ARK_KEY = process.env.ARK_API_KEY;
if (!ARK_KEY) console.warn("ARK_API_KEY not set in .env");

// POST API for image generation
app.post("/imageGenerationByPrompt", async (req, res) => {
  try {
    const { prompt, size = "2K" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
      {
        model: "seedream-4-0-250828",
        prompt: prompt,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: size,
        stream: false,
        watermark: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ARK_API_KEY}`,
        },
      }
    );

    res.json({
      success: true,
      data: response.data,
      imageUrl: response.data.data[0].url,
    });
  } catch (error) {
    console.error(
      "Image generation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || "Image generation failed",
    });
  }
});

app.get("/genImage", async (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, "genImage.html"));
  } catch (err) {
    return res.status(500).json({ status: false });
  }
});

app.get("/variation", async (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, "imgToimgVariation.html"));
  } catch (err) {
    return res.status(500).json({ status: false });
  }
});

/* 
function findFirstUrl(obj) {
  const urlRegex = /https?:\/\/[^\s'"]+/;
  const seen = new Set();
  function walker(x) {
    if (seen.has(x)) return null;
    seen.add(x);
    if (!x) return null;
    if (typeof x === "string") {
      const m = x.match(urlRegex);
      if (m) return m[0];
      return null;
    }
    if (Array.isArray(x)) {
      for (const item of x) {
        const res = walker(item);
        if (res) return res;
      }
    } else if (typeof x === "object") {
      for (const k of Object.keys(x)) {
        const res = walker(x[k]);
        if (res) return res;
      }
    }
    return null;
  }
  return walker(obj);
}

 
app.post("/imageToImageGeneration", async (req, res) => {
  try {
    const prompt =
      req.body.prompt ||
      req.query.prompt ||
      "Generate a close-up image of a dog lying on lush grass.";

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
      size: "4K",
      stream: false,
      watermark: false,
    };

    const headers = { "Content-Type": "application/json" };
    if (ARK_KEY) headers["Authorization"] = `Bearer ${ARK_KEY}`;

    const arkResp = await axios.post(ARK_URL, payload, {
      headers,
      timeout: 120000,
    });

    const maybeUrl = findFirstUrl(arkResp.data) || null;

    return res.json({
      success: true,
      prompt,
      imageProvided: imageField.startsWith("data:")
        ? "[base64-data]"
        : imageField,
      extractedUrl: maybeUrl,
      raw: arkResp.data,
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
}); 
*/

app.get("/imageToImage", async (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, "imgToimg.html"));
  } catch (err) {
    return res.status(500).json({ status: false });
  }
});

const admin = require("./routing/adminRouting");

const routing = require("./routing/routing");
const suppliers = require("./routing/suppliersRouting");
app.use("/", routing);

app.use("/", admin);

app.use("/", suppliers);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
