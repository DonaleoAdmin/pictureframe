const express = require("express");
const router = express.Router();
const fs = require("fs");
const {
  getSettings,
  saveSettings,
  getDefaultDir,
  loadSubdirectories,
} = require("./utils");
const settings = require("./settings.js");
const uploads = require("./upload.js");

router.use(settings);
router.use(uploads);

/* GET home page. */
router.get("/", async function (req, res, next) {
  const content = await loadSubdirectories(); //getSettings();
  res.render("index", { page: "Settings", menuId: "home", items: content });
});

router.get("/upload", async function (req, res, next) {
  const defaultDir = await getDefaultDir();
  res.render("upload", {
    page: "Upload Images",
    menuId: "upload",
    defaultDir: defaultDir,
  });
});

router.get("/about", (req, res, next) => {
  res.render("about", { page: "About Us", menuId: "about" });
});

router.get("/contact", (req, res, next) => {
  res.render("contact", { page: "Contact Us", menuId: "contact" });
});

module.exports = router;
