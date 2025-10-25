const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const { Readable } = require("stream");




// multiple image upload
exports.uploadProductImages = async (images, folderName) => {
  let imgUrl = [];
  for (let i = 0; i < images.length; i++) {
    let result = await cloudinary.uploader.upload(images[i].tempFilePath, {
      folder: folderName,
    });
    imgUrl.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  return imgUrl;
};

// multiple image destory from resource

exports.destroyProductImages = async (images) => {
  if (images.length == 0) {
    return {
      status: true,
      message:
        "No image to delete true to handle a senario when previos image not available",
    };
  }
  let deletedResults = [];

  for (let i = 0; i < images.length; i++) {
    try {
      if (images[i].public_id) {
        let result = await cloudinary.uploader.destroy(images[i].public_id);

        if (result.result === "ok") {
          deletedResults.push({
            public_id: images[i].public_id,
            status: "deleted",
          });
        } else {
          deletedResults.push({
            public_id: images[i].public_id,
            status: "failed",
            message: "Failed to delete image from resource",
          });
        }
      }
    } catch (error) {
      deletedResults.push({
        public_id: images[i].public_id,
        status: "error",
        message: error.message,
      });
    }
  }

  return {
    status: true,
    message: "Image deletion process complete",
    data: deletedResults,
  };
};





/**
 * Upload an image, create an eager derived version with background removal,
 * and return the public_id and url of the derived (BG removed) image when available.
 */
exports.uploadSingleImageBackgroundRemover = async (image, folderName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      // NOTE: we upload the original, but request an eager transformation
      // that applies the background_removal effect and produces a PNG with transparency.
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: folderName,
            // upload the original, and ask Cloudinary to create an eager derived image
            eager: [
              { effect: "background_removal", format: "png" }, // eager derived BG-removed PNG
            ],
            eager_async: false, // wait for eager to finish before returning if possible
            // you can set eager_notification_url here if you want async callbacks
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(image.data);
    });

    // Inspect the whole result in logs to debug (look for `eager` array).
    // console.log("cloudinary upload result:", result);

    // If eager exists and has at least one entry, take that as the BG-removed image
    let bgRemovedPublicId = null;
    let bgRemovedUrl = null;

    if (
      result.eager &&
      Array.isArray(result.eager) &&
      result.eager.length > 0
    ) {
      bgRemovedPublicId =
        result.eager[0].public_id ||
        result.public_id + "_eager_background_removed";
      bgRemovedUrl = result.eager[0].secure_url || result.eager[0].url;
    } else {
      // Fallback: construct a transformed URL using the transformation string.
      // This will *render* a background-removed result if your account supports the add-on,
      // even if eager wasn't returned in the upload result.
      // Note: this will NOT create a derived asset in your Media Library, it's just the URL.
      bgRemovedPublicId = result.public_id;
      try {
        bgRemovedUrl = cloudinary.url(result.public_id, {
          transformation: [{ effect: "background_removal" }, { format: "png" }],
          secure: true,
          resource_type: "image",
        });
      } catch (e) {
        bgRemovedUrl = result.secure_url;
      }
    }

    // Return the BG-removed derived info if available; otherwise return original as fallback,
    // but include the `result` so you can see exactly what Cloudinary returned.
    return {
      status: true,
      message:
        "Upload completed. Check `data` for BG-removed URL (or fallback).",
      data: {
        original_public_id: result.public_id,
        original_url: result.secure_url,
        bg_removed_public_id: bgRemovedPublicId,
        bg_removed_url: bgRemovedUrl,
        // raw_result: result // helpful for debugging on your server console only
      },
    };
  } catch (error) {
    console.error("uploadSingleImageBackgroundRemover error:", error);
    return {
      status: false,
      message: "Image upload failed: " + error.message,
      error,
    };
  }
};

// exports.uploadSingleImageBackgroundRemover = async (image, folderName) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream(
//           {
//             resource_type: "image",
//             folder: folderName,
//             // ask Cloudinary to create a stored eager derived image (BG removed)
//             eager: [{ effect: "background_removal", format: "png" }],
//             eager_async: false, // try to wait for eager processing and return eager in result
//             overwrite: false,
//             invalidate: false,
//           },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         )
//         .end(image.data);
//     });

//     // console.log("cloudinary upload result:", result);

//     let bgRemovedPublicId = null;
//     let bgRemovedUrl = null;

//     if (
//       result.eager &&
//       Array.isArray(result.eager) &&
//       result.eager.length > 0
//     ) {
//       // Cloudinary created a stored derived asset and returned its metadata
//       bgRemovedPublicId = result.eager[0].public_id; // store this in DB
//       bgRemovedUrl = result.eager[0].secure_url;
//     } else {
//       // Fallback: if eager not present, we didn't get a stored derived asset.
//       // We can still construct a URL for rendering, but this DOES NOT create a stored derived asset.
//       bgRemovedPublicId = null;
//       try {
//         bgRemovedUrl = cloudinary.url(result.public_id, {
//           transformation: [{ effect: "background_removal" }, { format: "png" }],
//           resource_type: "image",
//           secure: true,
//         });
//       } catch (e) {
//         bgRemovedUrl = result.secure_url;
//       }
//     }

//     return {
//       status: true,
//       message: "Upload completed",
//       data: {
//         original_public_id: result.public_id,
//         original_url: result.secure_url,
//         bg_removed_public_id: bgRemovedPublicId,
//         bg_removed_url: bgRemovedUrl,
//       },
//     };
//   } catch (error) {
//     console.error("uploadSingleImageBackgroundRemover error:", error);
//     return {
//       status: false,
//       message: "Image upload failed: " + error.message,
//       error,
//     };
//   }
// };

// Single Image Destroy

exports.deleteSingleImage = async (image) => {
  try {
    if (image.public_id) {
      // console.log("image.public_id", image.public_id)
      const result = await cloudinary.uploader.destroy(image.public_id);
      // console.log("result", result)
      if (result.result !== "ok") {
        return {
          status: false,
          message: "Image deletion failed",
        };
      }

      return {
        status: true,
        message: "Image deleted successfully",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: "Image deletion failed: " + error.message,
    };
  }
};

//bg Changer

/**
 * Upload an image, create an eager derived version with background removal,
 * and return the public_id and url of the derived (BG removed) image when available.
 */
exports.uploadSingleImageBackgroundChanger = async (
  image,
  folderName = "backgroundChanger",
  prompt = ""
) => {
  try {
    if (!image || !image.data) {
      return { status: false, message: "Invalid image data" };
    }

    // sanitize/limit prompt length (Cloudinary may have limits)
    let safePrompt = String(prompt || "").trim();
    if (safePrompt.length === 0) {
      // default prompt
      safePrompt =
        "Minimalist background with a soft pastel gradient and even lighting";
    }
    // ensure prompt is not too long
    if (safePrompt.length > 220) safePrompt = safePrompt.slice(0, 220);

    // Build transformation string. Use `gen_background_replace:prompt_<your prompt>`
    const genBgEffect = `gen_background_replace:prompt_${safePrompt}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: folderName,
            eager: [
              // Derived image with replaced background, PNG to preserve transparency if needed
              { effect: genBgEffect, format: "png" },
            ],
            eager_async: false, // try to wait for eager generation; set true if you prefer background job
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          }
        )
        .end(image.data);
    });

    // pick eager derived if available
    let replacedPublicId = null;
    let replacedUrl = null;

    if (
      result.eager &&
      Array.isArray(result.eager) &&
      result.eager.length > 0
    ) {
      replacedPublicId =
        result.eager[0].public_id || `${result.public_id}_eager_0`;
      replacedUrl = result.eager[0].secure_url || result.eager[0].url;
    } else {
      // fallback: build an on-the-fly URL with the same transformation (won't create a derived asset)
      try {
        replacedPublicId = result.public_id;
        replacedUrl = cloudinary.url(result.public_id, {
          transformation: [{ effect: genBgEffect }, { format: "png" }],
          secure: true,
          resource_type: "image",
        });
      } catch (e) {
        replacedPublicId = result.public_id;
        replacedUrl = result.secure_url;
      }
    }

    if (
      !result.secure_url ||
      result.secure_url == "undefined" ||
      !replacedUrl ||
      replacedUrl == "undefined"
    ) {
      return {
        status: false,
        message: "Image upload / background replace failed",
      };
    }

    return {
      status: true,
      message: "Upload completed",
      data: {
        original_public_id: result.public_id,
        original_url: result.secure_url,
        replaced_public_id: replacedPublicId,
        replaced_url: replacedUrl,
        raw_result: undefined, // avoid sending full raw result; set to result for debug if needed
      },
      meta: {
        cloudinary_result: {
          public_id: result.public_id,
          format: result.format,
          eager:
            result.eager && result.eager.length
              ? { first: result.eager[0] }
              : undefined,
        },
      },
    };
  } catch (error) {
    console.error("uploadSingleImageBackgroundChanger error:", error);
    return {
      status: false,
      message:
        "Image upload / background replace failed: " +
        (error.message || String(error)),
      error,
    };
  }
};

exports.imageUrlToImageStoreCloudinary = async (responseUrl, folderName) => {
  try {
    const imageResponse = await axios.get(responseUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data, "binary");
    const imageStream = new Readable();
    imageStream.push(imageBuffer);
    imageStream.push(null);

    // Upload the image to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: folderName,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload image to Cloudinary"));
          } else {
            resolve(result);
          }
        }
      );
      imageStream.pipe(uploadStream);
    });

    const imgData = {
      public_id: uploadResponse.public_id,
      url: uploadResponse.secure_url,
    };

    return {
      status: true,
      message: "image uploaded on cloudinary successfully",
      data: imgData,
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
};
