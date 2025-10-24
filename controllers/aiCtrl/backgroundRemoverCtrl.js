const BackgroundRemoverModel = require("../../models/aiModels/bgRemoverModel");
const userAIWalletModel = require("../../models/userModel/userWalletModel");
const {
  uploadSingleImageBackgroundRemover,
  deleteSingleImage,
} = require("../../utils/backgroundRemover");

/* 

        original_public_id: result.public_id,
        original_url: result.secure_url,
        bg_removed_public_id: bgRemovedPublicId,
        bg_removed_url: bgRemovedUrl, 
        
        */
//Remove background from image and save info to DB

exports.removeBackground = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const wallet = await userAIWalletModel.findOne({ userId: req.user._id });

    if (!wallet) {
      return res
        .status(404)
        .json({ status: false, message: "Not Found Wallet" });
    }

    if (wallet.credit < 1) {
      return res.status(400).json({
        status: false,
        message:
          "Insufficient Balance Recharge Now wallet should have more than 1 credit to use this service",
      });
    }

    let data = req.body;

    let userId = req.user._id;

    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ status: false, message: "No image uploaded" });
    }
    const image = req.files.image;

    const result = await uploadSingleImageBackgroundRemover(
      image,
      "backgroundRemoved"
    );

    // console.log("result", result);

    if (result.status === false) {
      return res.status(400).json({ status: false, message: result.message });
    }

    data = {
      userId: userId,
      original_img: {
        public_id: result.data.original_public_id,
        url: result.data.original_url,
      },
      bg_removed_img: {
        public_id: result.data.bg_removed_public_id,
        url: result.data.bg_removed_url,
      },
    };

    const saveData = await BackgroundRemoverModel.create(data);

    if (!saveData) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to save image data" });
    }

        // update wallet credit by -1 for each call
        const updatedWallet = await userAIWalletModel.findOneAndUpdate(
          { userId: req.user._id, credit: { $gte: 1 } },
          { $inc: { credit: -1 } },
          { new: true }
        );

        if (!updatedWallet) {
      return res.status(409).json({
        status: false,
        message:
          "Unable to deduct credit: insufficient balance (race condition). Please try again after recharge or try once more.",
      });
    }



    return res.status(201).json({
      status: true,
      message: "image saved successfully",
      data: saveData,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// Get all background removed images for a user
exports.getAllBackgroundRemovedImages = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    let userId = req.user._id;

    const images = await BackgroundRemoverModel.find({ userId: userId });

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
exports.deleteBackgroundRemovedImage = async (req, res) => {
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
    const image = await BackgroundRemoverModel.findOneAndDelete({
      _id: imageId,
      userId: userId,
    });

    if (!image) {
      return res
        .status(404)
        .json({ status: false, message: "Image not found" });
    }

    const check1 = await deleteSingleImage(image.original_img);

    const check2 = await deleteSingleImage(image.bg_removed_img);

    console.log("check1", check1);
    console.log("check2", check2);

    // await image.remove();

    return res.status(200).json({
      status: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
