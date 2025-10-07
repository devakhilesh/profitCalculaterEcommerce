const appUpdateModel = require("../../models/adminModel/adminAppUpdateModel");

function isValidVersionString(v) {
  if (typeof v !== "string") return false;
  // allow 1, 1.0, 1.0.0 etc (1-3 numeric parts)
  return /^\d+(\.\d+){0,2}$/.test(v.trim());
}

// Returns: 1 if a > b, 0 if equal, -1 if a < b

function cmpSemver(a, b) {
  const pa = String(a)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const pb = String(b)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

// create

export const createLatestVersionAdmin = async (req, res) => {
  try {
    const data = req.body;

    const { latestVersion, downloadLink } = data;

    if (!latestVersion || typeof latestVersion !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide valid latestVersion" });
    }
    if (!latestVersion) {
      return res
        .status(400)
        .json({ status: false, message: "Please porvide valid latestVersion" });
    }

    if (!isValidVersionString(latestVersion)) {
      return res.status(400).json({
        status: false,
        message:
          "latestVersion must be numeric semver-like string (examples: '1', '1.0', '1.0.2')",
      });
    }

    if (!downloadLink || typeof downloadLink !== "string") {
      return res.status(400).json({
        status: false,
        message: "Please porvide valid downloadable link",
      });
    }

    const doc = await appUpdateModel.findOneAndUpdate(
      {},
      {
        platform: "android",
        latestVersion: latestVersion,
        downloadLink: downloadLink,
        disclaimer: "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "Version updated successfull",
      data: doc,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get

export const getLatestVersionAdmin = async (req, res) => {
  try {
    const doc = await appUpdateModel.findOne();

    if (!doc) {
      return res
        .status(400)
        .json({ status: true, message: "Version not  found" });
    }

    return res.status(200).json({
      status: true,
      message: "Version fetched successfull",
      data: doc,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// for user  public

export const userCheckVersion = async (req, res) => {
  try {
    const appVersion = (req.query.appVersion || "").toString().trim();
    if (!appVersion) {
      return res
        .status(400)
        .json({ status: false, message: "appVersion query param is required" });
    }

    // fetch latest android config (most recently updated)
    const cfg = await appUpdateModel
      .findOne({ platform: "android" })
      .sort({ updatedAt: -1 })
      .lean();

    if (!cfg) {
      return res
        .status(404)
        .json({ status: false, message: "Version config not found" });
    }

    const latestVersion = cfg.latestVersion;
    const cmp = cmpSemver(appVersion, latestVersion);
    const isUpdated = cmp >= 0;

    return res.json({
      status: true,
      latestVersion,
      appVersion,
      appDownloadOrUpdateLink: cfg.downloadLink,
      isUpdated,
      disclaimer: cfg.disclaimer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};
