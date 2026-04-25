const fs = require("node:fs/promises");
const path = require("node:path");

const USERNAME = "storyhub";
const PASSWORD = "ensemble";

function unauthorized(res) {
  res.setHeader("WWW-Authenticate", 'Basic realm="StoryHub Proposal"');
  res.setHeader("Cache-Control", "no-store");
  res.status(401).send("Authentication required.");
}

module.exports = async function handler(req, res) {
  const authorization = req.headers.authorization;
  const expected = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64")}`;

  if (!authorization || authorization !== expected) {
    return unauthorized(res);
  }

  const url = new URL(req.url, "https://storyhub-orix-life.vercel.app");
  const routePath = url.pathname.replace(/\/+$/, "") || "/";
  const routeMap = {
    "/": "index.html",
  };
  const target = routeMap[routePath];

  if (!target) {
    return res.status(404).send("Not Found");
  }

  const htmlPath = path.join(__dirname, "..", target);
  const html = await fs.readFile(htmlPath, "utf8");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  return res.status(200).send(html);
};
