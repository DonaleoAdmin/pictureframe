const { exec } = require("child_process");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const dataPath = "./settings.json";
const codePath = "./settings-code.json";

async function getSubdirectories(parentDir) {
  try {
    const files = await fs.readdir(parentDir);
    const subdirs = [];

    for (const file of files) {
      const filePath = path.join(parentDir, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        subdirs.push(file);
      }
    }

    return subdirs;
  } catch (err) {
    console.log("Error:", err);
  }
}

async function parseExclusionDirString(subdirs, parentDir) {
  const excludeArr = [];
  const hasExclusion = subdirs.some((d) => d.show === false);
  if (hasExclusion) {
    for (let i = 0; i < subdirs.length; i++) {
      const dir = subdirs[i];
      if (dir.show === false) {
        const name = addDirectoryWithSpace(dir.name);
        const str = `-path ${parentDir}/${name}`;
        excludeArr.push(str);
      }
    }
    const results = `\\( ${excludeArr.join(" -o ")} \\) -prune -o`;
    return results;
  } else {
    return [];
  }
}

async function parseFileTypeString(jsonData) {
  const fileTypes = jsonData.imageTypes;
  const hasOther = fileTypes.some((f) => f.show === true && f.id !== 1);
  // const hasOnlyJpg = !hasOther && fileTypes.find((f) => f.id === 1);

  // \( -name '*.jpg' -o -name '*.png' \)
  const typeArr = [];
  if (hasOther) {
    for (let i = 0; i < fileTypes.length; i++) {
      const item = fileTypes[i];
      if (item.show) typeArr.push(`-name '*${item.name}'`);
    }
    const results = `\\( ${typeArr.join(" -o ")} \\)`;
    return results;
  } else {
    return [];
  }
}

function addDirectoryWithSpace(inputPath) {
  const splitArr = inputPath.split("/");
  const quotedItems = splitArr.map((item) => {
    if (item.includes(" ")) {
      return `'${item}'`;
    }
    return item;
  });

  return quotedItems.join("/");
}

module.exports = {
  getSettings: async () => {
    // const jsonData = fs.readFileSync(dataPath);
    // return JSON.parse(jsonData);
    const data = await fs.readFile(dataPath, "utf8");
    return JSON.parse(data);
  },

  saveSettings: async (data) => {
    const stringData = JSON.stringify(data);
    // fs.writeFileSync(dataPath, stringData);
    await fs.writeFile(dataPath, stringData, "utf8");
  },

  updateFolderSettings: async (id, newValue, isLocal) => {
    try {
      // Read the JSON file
      const data = await fs.readFile(dataPath, "utf8");

      // Parse the JSON data
      const jsonData = JSON.parse(data);

      // Update specific folder
      let folder;
      if (isLocal) {
        folder = jsonData.localSubdirs.find((f) => f.id === id);
      } else {
        folder = jsonData.usbSubdirs.find((f) => f.id === id);
      }

      if (folder) {
        folder.show = newValue === null ? true : newValue;
      } else {
        console.log("Folder not found");
        return;
      }

      // Write the updated data back to the JSON file
      await fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), "utf8");
      console.log("Folder has been updated...", folder);
    } catch (err) {
      console.error("Error updating folder:", err);
    }
  },

  updateFileType: async (id, newValue) => {
    try {
      const data = await fs.readFile(dataPath, "utf8");
      const jsonData = JSON.parse(data);

      const fileType = jsonData.imageTypes.find((t) => t.id === id);
      if (fileType) {
        fileType.show = newValue === null ? true : newValue;
      } else {
        console.log("Image type not found");
        return;
      }

      await fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), "utf8");
      console.log("File type has been updated...", fileType);
    } catch (err) {
      console.error("Error updating file type:", err);
    }
  },

  getDefaultDir: async () => {
    const data = await fs.readFile(dataPath, "utf8");
    const jsonData = JSON.parse(data);
    if (jsonData.mediaSource === "usb") return jsonData.usbLocation;
    else return jsonData.localLocation;
  },

  getSelectedFolder: async () => {
    const data = await fs.readFile(dataPath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData.selectedFolder;
  },

  loadSubdirectories: async () => {
    // const data = fs.readFileSync(dataPath);
    const data = await fs.readFile(dataPath, "utf8");
    const jsonData = JSON.parse(data);

    let parentDir = "";
    let node = "";
    let currDirs = [];

    if (jsonData.mediaSource === "usb") {
      node = "usbSubdirs";
      parentDir = jsonData.usbLocation;
      currDirs = [...jsonData.usbSubdirs];
    } else {
      node = "localSubdirs";
      parentDir = jsonData.localLocation;
      currDirs = [...jsonData.localSubdirs];
    }

    try {
      const subdirs = await getSubdirectories(parentDir);
      const folders = [];

      for (let i = 0; i < subdirs?.length; i++) {
        const name = subdirs[i];
        const currFolder = currDirs.find(
          (d) => d.name.toLowerCase() === name.toLowerCase()
        );
        const show = currFolder ? currFolder.show : true;
        const newFolder = { id: i + 1, name: name, show: show };
        folders.push(newFolder);
      }

      jsonData[node] = folders;
      // fs.writeFileSync(dataPath, JSON.stringify(jsonData));
      await fs.writeFile(dataPath, JSON.stringify(jsonData), "utf8");
      return jsonData;
    } catch (err) {
      console.log("Error:", err);
      throw err;
    }
  },

  encodeSettings: async (partial = false) => {
    let encodedArr = ["feh"];
    // const data = fs.readFileSync(dataPath);
    const data = await fs.readFile(dataPath, "utf8");
    const jsonData = JSON.parse(data);

    // const codes = fs.readFileSync(codePath);
    const codes = await fs.readFile(codePath, "utf8");
    const jsonCodes = JSON.parse(codes);

    const entries = Object.entries(jsonData);
    entries.forEach(([key, value]) => {
      // console.log(`${key}: ${JSON.stringify(value)}`);
      const code = jsonCodes[key];
      if (value && value == true) encodedArr.push(code);

      if (key === "imageBackground" || key === "delayInSecond")
        encodedArr.push(code + " " + value);
    });

    // console.log(jsonData);
    let parentPath = jsonData.localLocation;
    let subdirs = jsonData.localSubdirs;
    if (jsonData["mediaSource"] === "usb") {
      parentPath = jsonData.usbLocation;
      subdirs = jsonData.usbSubdirs;
    }

    parentPath = parentPath.replace(/\/$/, ""); // Replace the trailing slash if it exists
    const parentDir = addDirectoryWithSpace(parentPath);
    const excludedDirStr = await parseExclusionDirString(subdirs, parentDir);
    let fileTypeStr = await parseFileTypeString(jsonData);
    let commandTxt = "";

    const hasExclusion = excludedDirStr.length > 0;
    const hasOtherFileType = fileTypeStr.length > 0;

    if (hasExclusion || hasOtherFileType) {
      fileTypeStr = fileTypeStr.length > 0 ? fileTypeStr : "-name '*.jpg'";
      commandTxt = `find ${parentDir} ${excludedDirStr} -type f ${fileTypeStr} -print | ${encodedArr.join(
        " "
      )} -f -`;
    } else {
      encodedArr.push(parentDir);
      commandTxt = `${encodedArr.join(" ")}`;
    }

    // find /home/pi/pictures \( -path /home/pi/pictures/exclude1 -o -path /home/pi/pictures/exclude2 \) -prune -o -type f -name '*.jpg' -print | feh --slideshow-delay 5 -f -
    // find "$MAIN_DIR" \( -path "$EXCLUDE_DIR1" -o -path "$EXCLUDE_DIR2" \) -prune -o -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.bmp' -o -iname '*.tiff' \) -print | feh --slideshow-delay 5 --fullscreen --randomize --auto-zoom -f -

    if (!partial) {
      return `os.system("${commandTxt}")`;
    } else {
      return commandTxt;
    }
  },

  stopSlideshow: () => {
    exec("pkill feh", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping slideshow process: ${error}`);
        // return res.status(500).send("Failed to stop slideshow");
      }
      console.log(`Kill stdout: ${stdout}`);
      console.error(`Kill stderr: ${stderr}`);
      // res.send("Stopping...");
    });
  },

  startSlideshow: (commandTxt) => {
    // console.log(commandTxt);
    exec(commandTxt, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting slideshow process: ${error}`);
        // return res.status(500).send("Failed to start slideshow");
      }
      console.log(`Start stdout: ${stdout}`);
      console.error(`Start stderr: ${stderr}`);
    });
  },

  rebootDevice: () => {
    exec("sudo reboot", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing reboot: ${error}`);
        // return res.status(500).send("Failed to reboot");
      }
      console.log(`Reboot stdout: ${stdout}`);
      console.error(`Reboot stderr: ${stderr}`);
      // res.send("Rebooting...");
    });
  },

  getIPAddress: () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log("IP Address:", iface.address);
          return iface.address;
        }
      }
    }
    return "IP address not found";
  },
};
