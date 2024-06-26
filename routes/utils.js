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
        folder.show = newValue == null ? true : newValue;
      } else {
        console.log("Folder not found");
        return;
      }

      // Write the updated data back to the JSON file
      await fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), "utf8");
      console.log("Folder has been updated...", folder);
    } catch (err) {
      console.error("Error processing the JSON file:", err);
    }
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
      //encodedArr.push(jsonData["usbLocation"]);
      parentPath = jsonData.usbLocation;
      subdirs = jsonData.usbSubdirs;
    } else {
      //encodedArr.push(jsonData["localLocation"]);
    }

    parentPath = parentPath.replace(/\/$/, ""); // Replace the trailing slash if it exists
    const parentDir = addDirectoryWithSpace(parentPath);
    let excludeArr = [];
    let commandTxt = "";
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
      commandTxt = `find ${parentDir} \\( ${excludeArr.join(
        " -o "
      )} \\) -prune -o -type f -name '*.jpg' -print / ${encodedArr.join(" ")}`;
    } else {
      encodedArr.push(jsonData[parentDir]);
      commandTxt = `${encodedArr.join(" ")}`;
    }

    // find /home/pi/pictures \( -path /home/pi/pictures/exclude1 -o -path /home/pi/pictures/exclude2 \) -prune -o -type f -name '*.jpg' -print | feh --slideshow-delay 5 -f -

    // console.log(encodedArr.join(" "));
    // if (!partial) return "os.system('" + encodedArr.join(" ") + "')";
    // else return encodedArr.join(" ");
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
    console.log(commandTxt);
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
