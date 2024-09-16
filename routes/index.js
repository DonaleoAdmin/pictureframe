const express = require("express");
const router = express.Router();
const fs = require("fs");
const {
  getSettings,
  saveSettings,
  getDefaultDir,
  loadSubdirectories,
} = require("./route-utils.js");
const settings = require("./route-settings.js");
const uploads = require("./route-upload.js");
const {
  routeFolder,
  getRandomImagesFromFolders,
} = require("./route-folder.js");

router.use(settings);
router.use(uploads);
router.use(routeFolder);

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

router.get("/albums", async (req, res, next) => {
  const images = await getRandomImagesFromFolders();
  res.render("albums", {
    page: "Albums",
    menuId: "albums",
    randomImages: images,
  });
});

router.get("/folder", (req, res, next) => {
  res.render("folder", { page: "Folder Info", menuId: "folder" });
});

module.exports = router;
