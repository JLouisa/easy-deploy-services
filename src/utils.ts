import { exec } from "child_process";
import path from "path";
import fs from "fs";

export function getOutputDir(): string {
  // Get the current directory
  const currentFolder = __dirname;

  // Get the parent directory of the current directory
  const parentFolder = path.dirname(currentFolder).concat(`/output`);

  return parentFolder;
}

export function buildProject(id: string) {
  console.log("Building project");
  return new Promise((resolve, reject) => {
    const child = exec(
      `cd ${path.join(getOutputDir(), id)} && npm install && npm run build`
    );

    child.stdout?.on("data", (data) => {
      console.log(data);
    });
    child.stderr?.on("data", (data) => {
      console.error(data);
    });
    child.on("close", (code) => {
      if (code === 0) {
        console.log("Build successful");
        resolve("");
      } else {
        reject();
      }
    });
  });
}

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);

  allFilesAndFolders.forEach((file) => {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      response = response.concat(getAllFiles(fullPath));
    } else {
      response.push(fullPath);
    }
  });

  return response;
};
