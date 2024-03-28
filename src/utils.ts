import path from "path";

export function getOutputDir() {
  // Get the current directory
  const currentFolder = __dirname;

  // Get the parent directory of the current directory
  const parentFolder = path.dirname(currentFolder).concat(`/output`);

  return parentFolder;
}
