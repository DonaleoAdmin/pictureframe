const express = require("express");
const { exec } = require("child_process");
const settingsRoutes = express.Router();
const fs = require("fs");
const {
  getSettings,
  saveSettings,
  updateFolderSettings,
  updateFileType,
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
settingsRoutes.get("/settings", async (req, res) => {
  const currSettings = await getSettings();
  res.send(currSettings);
});

// saving changes
settingsRoutes.post("/update", async (req, res) => {
  const currSettings = await getSettings();
  const key = req.body.key;
  const value = req.body.value;

  currSettings[key] = value;
  await saveSettings(currSettings);
  const replacementText = await encodeSettings(false);
  console.log(replacementText);
  await updateSlide(replacementText);
  res.send(currSettings);
});

settingsRoutes.post("/updateFolder", async (req, res) => {
  const { id, value, isLocal } = req.body;

  // Update folder settings
  await updateFolderSettings(id, value, isLocal);

  // Get the replacement text after settings have been updated
  const replacementText = await encodeSettings(false);
  console.log(replacementText);

  // Update the slide with the new replacement text
  await updateSlide(replacementText);

  // Send the response back to the client
  res.send({ id: id, show: value });
});

settingsRoutes.post("/updateFileType", async (req, res) => {
  const { id, value } = req.body;

  // Update file type settings
  await updateFileType(id, value);

  // Get the replacement text after settings have been updated
  const replacementText = await encodeSettings(false);
  console.log(replacementText);

  // Update the slide with the new replacement text
  await updateSlide(replacementText);

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

settingsRoutes.post("/restart", async (req, res) => {
  stopSlideshow();
  const commandTxt = await encodeSettings(true);
  // setTimeout(() => {}, 1000);
  startSlideshow(commandTxt);
  res.send("Restarting...");
});

settingsRoutes.get("/ip", (req, res) => {
  const ipAddress = getIPAddress();
  res.send(ipAddress);
});

module.exports = settingsRoutes;
