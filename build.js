const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const inputFolder = "./app";
const outputFolder = "./output";

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Function to copy and process files
function processFiles(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.error("Error reading input folder:", err);
      return;
    }

    files.forEach(async (file) => {
      const inputFilePath = path.join(inputDir, file);
      const outputFilePath = path.join(outputDir, file);

      fs.stat(inputFilePath, async (err, stats) => {
        if (err) {
          console.error(`Error reading file stats for ${file}:`, err);
          return;
        }

        if (stats.isDirectory()) {
          processFiles(inputFilePath, outputFilePath);
        } else if (path.extname(file) === ".js") {
          try {
            const code = fs.readFileSync(inputFilePath, "utf8");
            const result = await minify(code,{
                compress: true,
                mangle: true
            });

            if (result.code) {
              fs.writeFileSync(outputFilePath, result.code, "utf8");
            }
          } catch (error) {
            console.error(`Error minifying ${file}:`, error);
          }
        } else {
          fs.copyFileSync(inputFilePath, outputFilePath);
        }
      });
    });
  });
}

// Start processing
processFiles(inputFolder, outputFolder);
