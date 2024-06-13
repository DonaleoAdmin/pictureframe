const express = require("express");
const router = express.Router();
const fs = require("fs");
const { getSettings, saveSettings } = require("./utils");
const settings = require("./settings");

router.use(settings);

/* GET home page. */
router.get("/", function (req, res, next) {
  const content = getSettings();
  res.render("index", { page: "Settings", menuId: "home", items: content });
});

router.get("/about", (req, res, next) => {
  res.render("about", { page: "About Us", menuId: "about" });
});

router.get("/contact", (req, res, next) => {
  res.render("contact", { page: "Contact Us", menuId: "contact" });
});

module.exports = router;
