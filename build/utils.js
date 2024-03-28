"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.buildProject = exports.getOutputDir = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getOutputDir() {
    // Get the current directory
    const currentFolder = __dirname;
    // Get the parent directory of the current directory
    const parentFolder = path_1.default.dirname(currentFolder).concat(`/output`);
    return parentFolder;
}
exports.getOutputDir = getOutputDir;
function buildProject(id) {
    console.log("Building project");
    return new Promise((resolve, reject) => {
        var _a, _b;
        const child = (0, child_process_1.exec)(`cd ${path_1.default.join(getOutputDir(), id)} && npm install && npm run build`);
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => {
            console.log(data);
        });
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
            console.error(data);
        });
        child.on("close", (code) => {
            if (code === 0) {
                console.log("Build successful");
                resolve("");
            }
            else {
                reject();
            }
        });
    });
}
exports.buildProject = buildProject;
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach((file) => {
        const fullPath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullPath).isDirectory()) {
            response = response.concat((0, exports.getAllFiles)(fullPath));
        }
        else {
            response.push(fullPath);
        }
    });
    return response;
};
exports.getAllFiles = getAllFiles;
