const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const dataPath = "./settings.json";
const codePath = "./settings-code.json";

// getSubdirectories = (parentDir, callback) => {
//   fs.readdir(parentDir, (err, files) => {
//     if (err) return callback(err);

//     const subdirs = [];
//     let pending = files.length;

//     // No files/directories found
//     if (!pending) {
//       return callback(null, subdirs);
//     }

//     files.forEach((file) => {
//       const filePath = path.join(parentDir, file);
//       fs.stat(filePath, (err, stats) => {
//         if (err) return callback(err);
//         // Handle directory
//         if (stats.isDirectory()) subdirs.push(file);
//         // Handle callback
//         if (!--pending) callback(null, subdirs);
//       });
//     });
//   });
// };

function getSubdirectories(parentDir) {
  return new Promise((resolve, reject) => {
    fs.readdir(parentDir, (err, files) => {
      if (err) {
        return reject(err);
      }

      const subdirs = [];
      let pending = files.length;

      if (!pending) {
        // no files/directories found
        return resolve(subdirs);
      }

      files.forEach((file) => {
        const filePath = path.join(parentDir, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            return reject(err);
          }

          if (stats.isDirectory()) {
            subdirs.push(file);
          }

          if (!--pending) {
            resolve(subdirs);
          }
        });
      });
    });
  });
}

module.exports = {
  getSettings: () => {
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
  },

  saveSettings: (data) => {
    const stringData = JSON.stringify(data);
    fs.writeFileSync(dataPath, stringData);
  },

  updateFolderSettings: (id, newValue, isLocal) => {
    // Read the JSON file
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the JSON file:", err);
        return;
      }

      // Parse the JSON data
      const jsonData = JSON.parse(data);

      // Update specific folder
      let folder = "";
      if (isLocal) folder = jsonData.localSubdirs.find((f) => f.id === id);
      else folder = jsonData.usbSubdirs.find((f) => f.id === id);

      if (folder) {
        folder.show =
          newValue == null || newValue === undefined ? true : newValue;
      } else {
        console.log("Folder not found");
        return;
      }

      // Write the updated data back to the JSON file
      fs.writeFile(
        dataPath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("Folder has been updated");
          }
        }
      );
    });
  },

  loadSubdirectories: async () => {
    const data = fs.readFileSync(dataPath);
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

      for (let i = 0; i < subdirs.length; i++) {
        const name = subdirs[i];
        const currFolder = currDirs.find(
          (d) => d.name.toLowerCase() === name.toLowerCase()
        );
        const show = currFolder ? currFolder.show : true;
        const newFolder = { id: i + 1, name: name, show: show };
        folders.push(newFolder);
      }

      jsonData[node] = folders;
      fs.writeFileSync(dataPath, JSON.stringify(jsonData));
      return jsonData;
    } catch (err) {
      console.log("Error:", err);
      throw err;
    }
  },

  encodeSettings: (partial = false) => {
    let encodedArr = ["feh"];
    const data = fs.readFileSync(dataPath);
    const jsonData = JSON.parse(data);

    const codes = fs.readFileSync(codePath);
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
    if (jsonData["mediaSource"] === "usb")
      encodedArr.push(jsonData["usbLocation"]);
    else encodedArr.push(jsonData["localLocation"]);

    // console.log(encodedArr.join(" "));
    if (!partial) return "os.system('" + encodedArr.join(" ") + "')";
    else return encodedArr.join(" ");
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
