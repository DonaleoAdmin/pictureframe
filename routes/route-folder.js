const express = require("express");
const path = require("path");
const fs = require("fs");
const { getDefaultDir, getSelectedFolder } = require("./route-utils");
const routeFolder = express.Router();

async function initialize() {
  imagesDir = await getDefaultDir();

  // Serve the external directory as static
  routeFolder.use("/images", express.static(imagesDir));
}

// Call the initialize function
initialize();

// Route to list and display images
routeFolder.get("/folder", async (req, res) => {
  const folderName = await getSelectedFolder();
  // const folderName = req.params.name;
  //   const { name } = req.body;
  //   const folderName = name;

  // Read the directory for image files
  fs.readdir(path.join(imagesDir, folderName), (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }

    // Filter out only image files
    const images = files.filter((file) => {
      return file.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/);
    });

    // Render the index page and pass the image filenames
    res.render("folder", {
      page: "Folder Info",
      menuId: "folder",
      images,
      folderName,
    });
  });
});

// Route to delete selected images
routeFolder.post("/delete-images", (req, res) => {
  const imagesToDelete = req.body.images;

  if (!imagesToDelete || imagesToDelete.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No images to delete" });
  }

  let success = true;
  imagesToDelete.forEach((imagePath) => {
    const fullPath = path.join(imagesDir, imagePath); //path.resolve(imagePath);
    console.log("fullPath:", fullPath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Error deleting file ${fullPath}: `, err);
        success = false;
      }
    });
  });

  if (success) {
    res.json({ success: true, message: "Images deleted successfully" });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Some images could not be deleted" });
  }
});

module.exports = routeFolder;
