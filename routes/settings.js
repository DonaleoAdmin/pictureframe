const express = require("express");
const { exec } = require("child_process");
const settingsRoutes = express.Router();
const fs = require("fs");
const {
  getSettings,
  saveSettings,
  updateFolderSettings,
  loadSubdirectories,
  encodeSettings,
  getIPAddress,
  stopSlideshow,
  rebootDevice,
  startSlideshow,
} = require("./utils");
const { updateSlide } = require("./slideshow");

const dataPath = "./settings.json";

// reading the data
settingsRoutes.get("/settings", (req, res) => {
  const currSettings = getSettings();
  res.send(currSettings);
});

// saving changes
settingsRoutes.post("/update", (req, res) => {
  const currSettings = getSettings();
  const key = req.body.key;
  const value = req.body.value;

  currSettings[key] = value;
  saveSettings(currSettings);
  const replacementText = encodeSettings(false);
  // console.log(replacementText);
  updateSlide(replacementText);
  res.send(currSettings);
});

settingsRoutes.post("/updateFolder", (req, res) => {
  const id = req.body.id;
  const value = req.body.value;
  const isLocal = req.body.isLocal;

  updateFolderSettings(id, value, isLocal);
  res.send({ id: id, show: value });
});

settingsRoutes.get("/syncFolders", async (req, res) => {
  const data = await loadSubdirectories();
  res.send(data);
});

settingsRoutes.post("/reboot", (req, res) => {
  // // Check if the request is authorized (implement your own authentication)
  // const authToken = req.headers["authorization"];
  // if (authToken !== "your-secret-token") {
  //   return res.status(403).send("Forbidden");
  // }
  rebootDevice();
  res.send("Rebooting...");
});

settingsRoutes.post("/stop", (req, res) => {
  stopSlideshow();
  res.send("Stopping...");
});

settingsRoutes.post("/restart", (req, res) => {
  stopSlideshow();
  const commandTxt = encodeSettings(true);
  setTimeout(() => {}, 1000);
  startSlideshow(commandTxt);
  res.send("Restarting...");
});

settingsRoutes.get("/ip", (req, res) => {
  const ipAddress = getIPAddress();
  res.send(ipAddress);
});

module.exports = settingsRoutes;
