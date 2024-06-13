const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const dataPath = "./settings.json";
const codePath = "./settings-code.json";

module.exports = {
  getSettings: () => {
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
  },

  saveSettings: (data) => {
    const stringData = JSON.stringify(data);
    fs.writeFileSync(dataPath, stringData);
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
