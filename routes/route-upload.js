const express = require("express");
const fs = require("fs");
const multer = require("multer");
const uploadRoute = express.Router();

uploadRoute.post("/uploadFiles", (req, res) => {
  const userInputDir = req.header("X-Upload-Directory");

  if (!userInputDir) {
    return res.status(400).send("Directory not provided or is undefined.");
  }

  // Check if the directory exists and create it if necessary
  if (!fs.existsSync(userInputDir)) {
    fs.mkdirSync(userInputDir, { recursive: true });
  }

  // Configure multer storage with the user-specified directory
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, userInputDir);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage }).array("images");

  upload(req, res, function (err) {
    if (err) {
      return res.status(500).send("Error uploading files.");
    }
    const uploadedFiles = req.files.map((file) => file.originalname);
    if (uploadedFiles.length < 1) {
      res.send("No files to upload.");
    } else {
      res.send(`${uploadedFiles.length} file(s) uploaded successfully.`);
    }

    //   `Files uploaded successfully to ${userInputDir}: ${uploadedFiles.join(", ")}`
  });
});

module.exports = uploadRoute;
