const axios = require("axios");

const ARK_URL =
  "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
const ARK_KEY = process.env.ARK_API_KEY;
if (!ARK_KEY) console.warn("ARK_API_KEY not set in .env");

exports.findFirstUrl =  function (obj) {
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




