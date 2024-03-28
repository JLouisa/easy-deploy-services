"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutputDir = void 0;
const path_1 = __importDefault(require("path"));
function getOutputDir() {
    // Get the current directory
    const currentFolder = __dirname;
    // Get the parent directory of the current directory
    const parentFolder = path_1.default.dirname(currentFolder).concat(`/output`);
    return parentFolder;
}
exports.getOutputDir = getOutputDir;
