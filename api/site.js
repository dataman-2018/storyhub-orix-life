const fs = require("node:fs");
const path = require("node:path");

const USERNAME = "storyhub";
const PASSWORD = "ensemble";

// Pre-read at cold start
const indexPath = path.resolve(__dirname, "..", "index.html");
let indexHtml;
try {
  indexHtml = fs.readFileSync(indexPath, "utf8");
} catch (e) {
  indexHtml = null;
}

function unauthorized(res) {
  res.setHeader("WWW-Authenticate", 'Basic realm="StoryHub Proposal"');
  res.setHeader("Cache-Control", "no-store");
  return res.status(401).send("Authentication required.");
}

module.exports = function handler(req, res) {
  const authorization = req.headers.authorization;
  const expected = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64")}`;

  if (!authorization || authorization !== expected) {
    return unauthorized(res);
  }

  if (!indexHtml) {
    return res.status(500).send("index.html not found");
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  return res.status(200).send(indexHtml);
};
