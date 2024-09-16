const express = require("express");
const path = require("path");
const fs = require("fs");
const { getDefaultDir, getSelectedFolder } = require("./route-utils");
const routeFolder = express.Router();

let baseDir;

async function initialize() {
  baseDir = await getDefaultDir();

  // Serve the external directory as static
  routeFolder.use("/images", express.static(baseDir));
}

// Call the initialize function
initialize();

// Function to get a random image from a folder
function getRandomImageFromFolder(folderPath) {
  const images = fs.readdirSync(folderPath).filter((file) => {
    // Filter for image files (adjust extensions as needed)
    return file.match(/\.(jpg|jpeg|png|gif)$/i);
  });

  if (images.length === 0) return null; // Return null if no images are found
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

// Function to get random images from each folder in the base directory
function getRandomImagesFromFolders() {
  const folders = fs.readdirSync(baseDir).filter((folder) => {
    // Check if it's a directory
    return fs.statSync(path.join(baseDir, folder)).isDirectory();
  });

  // Create an array with folder names and random image for each folder
  const randomImages = folders.map((folder, index) => {
    const folderId = `folder${++index}`;
    const folderPath = path.join(baseDir, folder);
    const randomImage = getRandomImageFromFolder(folderPath);
    return {
      id: folderId,
      folderName: folder,
      image: randomImage,
    };
  });

  // Filter out folders with no images
  return randomImages.filter((img) => img.image !== null);
}

// Function to update a folder name
async function updateFolderName(oldFolderName, newFolderName) {
  // const baseDir = "/path/to/your/folders"; // Your base directory where folders are stored
  const oldFolderPath = path.join(baseDir, oldFolderName);
  const newFolderPath = path.join(baseDir, newFolderName);

  try {
    // Rename the folder
    await fs.promises.rename(oldFolderPath, newFolderPath);
    console.log(`Folder renamed from ${oldFolderName} to ${newFolderName}`);
    return { success: true, message: "Folder name updated successfully" };
  } catch (err) {
    console.error("Error renaming folder:", err);
    return { success: false, message: "Error renaming folder" };
  }
}

// Function to delete a folder and its contents
function deleteFolderSync(folderPath) {
  try {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Folder "${folderPath}" and its contents have been deleted.`);
    return true;
  } catch (err) {
    console.error(`Error while deleting folder ${folderPath}.`, err);
    return false;
  }
}

// Route to list and display images
routeFolder.get("/folder", async (req, res) => {
  const folderName = await getSelectedFolder();

  // Read the directory for image files
  fs.readdir(path.join(baseDir, folderName), (err, files) => {
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
    const fullPath = path.join(baseDir, imagePath);
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

routeFolder.post("/update-folder-name", async (req, res) => {
  const { oldFolderName, newFolderName } = req.body;

  // Check if new folder name is valid
  if (!newFolderName || !oldFolderName) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid folder name" });
  }

  const result = await updateFolderName(oldFolderName, newFolderName);
  res.json(result);
});

routeFolder.post("/delete-folders", (req, res) => {
  const { folders } = req.body;
  if (!folders || folders.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No folders to delete" });
  }

  let success = true;
  folders.forEach((folder) => {
    success = deleteFolderSync(path.join(baseDir, folder));
  });

  if (success) {
    res.json({ success: true, message: "Folders deleted successfully" });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Some folders could not be deleted" });
  }
});

// Route to handle image download
routeFolder.get("/download-image/:folder/:imageName", (req, res) => {
  const folder = req.params.folder;
  const imageName = req.params.imageName;
  const imagePath = path.join(baseDir, folder, imageName);

  res.download(imagePath, imageName, (err) => {
    if (err) {
      console.error("Error downloading image:", err);
      res.status(500).send("Error downloading the image.");
    } else {
      console.log("Image downloaded:", imageName);
    }
  });
});

// Export both routeFolder and getRandomImagesFromFolders
module.exports = {
  routeFolder,
  getRandomImagesFromFolders,
};
