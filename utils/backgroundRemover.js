const cloudinary = require("cloudinary").v2;

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
