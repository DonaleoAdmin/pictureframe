const fs = require("fs");
const path = require("path");

// Define the file path
const filePath = path.join(__dirname, "../slideshow.py");
// const filename = path.join("../", "slideshow.py");
// const filePath = path.resolve(filename)

// Define the line to search for and the replacement text
// const searchLine =
//   'os.system("feh -Y -x -q -z -D 7 --auto-rotate -B black -F -Z -r  /media/")';
// const replaceLine = "This is the new line";

module.exports = {
  updateSlide: async (replacementText) => {
    // Read the file content
    console.log(filePath);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      // // Split the content by lines
      // const lines = data.split('\n');

      // // Modify the specific line
      // // lines[lineNumberToModify] = lines[lineNumberToModify].replace(searchText, replaceText);

      // // Find and replace the line
      // const updatedLines = lines.map(line => {
      //     if (line.includes(searchLine)) {
      //         return replaceLine;
      //     }
      //     return line;
      // });

      // // Join the lines back into a single string
      // const updatedContent = updatedLines.join('\n');

      // Use regular expression to match lines starting with "os.system"
      const updatedContent = data.replace(/^os\.system.*$/gm, replacementText);

      // Write the updated content back to the file
      fs.writeFile(filePath, updatedContent, "utf8", (err) => {
        if (err) {
          console.error("Error writing the file:", err);
          return;
        }
        console.log("File has been updated successfully.");
      });
    });
  },
};
