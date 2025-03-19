const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const { exec } = require("child_process");

const inputFolder = "alukasiewicz.client";
const outputFolder = "alukasiewicz.client/.output";

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Function to copy, transpile, and process files
async function processFiles(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const files = await fs.promises.readdir(inputDir);

    for (const file of files) {
      const inputFilePath = path.join(inputDir, file);
      const outputFilePath = path.join(outputDir, file);

      // Skip the output folder
      if (
        inputFilePath.includes(outputFolder) ||
        inputFilePath.includes(".output")
      ) {
        continue;
      }

      const stats = await fs.promises.stat(inputFilePath);

      if (stats.isDirectory()) {
        // Recursively process subdirectories
        await processFiles(inputFilePath, outputFilePath);
      } else if (path.extname(file) === ".ts") {
        // Transpile TypeScript files to JavaScript and then minify
        const jsOutputFilePath = outputFilePath.replace(/\.ts$/, ".js");
        try {
          await transpileTypeScript(inputFilePath, jsOutputFilePath);
          console.log(`Transpiled: ${inputFilePath} -> ${jsOutputFilePath}`);

          // Minify the transpiled JavaScript file
          const code = await fs.promises.readFile(jsOutputFilePath, "utf8");
          const result = await minify(code, {
            compress: true,
            mangle: true,
          });

          if (result.code) {
            await fs.promises.writeFile(jsOutputFilePath, result.code, "utf8");
            console.log(`Minified: ${jsOutputFilePath}`);
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      } else if (path.extname(file) === ".js") {
        // Minify JavaScript files
        try {
          const code = await fs.promises.readFile(inputFilePath, "utf8");
          const result = await minify(code, {
            compress: true,
            mangle: true,
          });

          if (result.code) {
            await fs.promises.writeFile(outputFilePath, result.code, "utf8");
            console.log(`Minified: ${inputFilePath} -> ${outputFilePath}`);
          }
        } catch (error) {
          console.error(`Error minifying ${file}:`, error);
        }
      } else {
        // Copy other files as-is
        await fs.promises.copyFile(inputFilePath, outputFilePath);
        console.log(`Copied: ${inputFilePath} -> ${outputFilePath}`);
      }
    }
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

// Function to transpile TypeScript files
function transpileTypeScript(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const command = `tsc ${inputFilePath} --outFile ${outputFilePath}`;
    exec(command, (error, stdout, stderr) => {
      resolve(stdout);
    });
  });
}

// Start processing
processFiles(inputFolder, outputFolder).then(() => {
  console.log("All files processed successfully.");
});
