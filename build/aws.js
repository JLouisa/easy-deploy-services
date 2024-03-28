"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadS3Files = void 0;
const env_1 = require("./env");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const promises_1 = require("fs/promises");
const client_s3_1 = require("@aws-sdk/client-s3");
const uploadService = env_1.env.UPLOAD_SERVICE === "aws" ? true : false;
const s3 = new client_s3_1.S3Client([
    {
        region: uploadService ? env_1.env.AWS_REGION : "auto",
        endpoint: uploadService ? undefined : env_1.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
            accessKeyId: uploadService
                ? env_1.env.AWS_ACCESS_KEY_ID
                : env_1.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
            secretAccessKey: uploadService
                ? env_1.env.AWS_SECRET_ACCESS_KEY
                : env_1.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        },
        // debug: true, // Enable debugging
    },
]);
// const streamToString = (stream: NodeJS.ReadableStream) =>
//   new Promise<string>((resolve, reject) => {
//     const chunks: Buffer[] = [];
//     stream.on("data", (chunk) => chunks.push(chunk));
//     stream.on("error", reject);
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
//   });
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});
const downloadS3Files = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Download started");
    const prefix = `output/${id}`; // Adjust the prefix dynamically
    console.log("Prefix:", prefix);
    // Configure S3 parameters
    const params = {
        Bucket: env_1.env.BUCKET_NAME,
        Prefix: prefix,
    };
    // Get list of all specified files
    const getListAllFiles = yield s3.send(new client_s3_1.ListObjectsV2Command(params));
    // Create a directory to save downloaded files
    const outputDir = (0, utils_1.getOutputDir)();
    yield (0, promises_1.mkdir)(outputDir, { recursive: true }); // Ensure the directory is created
    // Download each file asynchronously
    const downloadPromises = (getListAllFiles.Contents || [])
        .map((object) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Object:", object);
        if (object === null || object === void 0 ? void 0 : object.Key) {
            const objectKey = object.Key;
            const commandGet = new client_s3_1.GetObjectCommand({
                Bucket: env_1.env.BUCKET_NAME,
                Key: objectKey,
            });
            try {
                const { Body } = yield s3.send(commandGet);
                // Ensure the directory structure exists for the file
                const dirPath = path_1.default.dirname(objectKey);
                yield (0, promises_1.mkdir)(dirPath, { recursive: true });
                // Finish saving the files to the output directory
                const bodyContents = yield streamToString(Body);
                return (0, promises_1.writeFile)(objectKey, bodyContents);
            }
            catch (error) {
                console.error("Error occurred while downloading:", error);
            }
        }
    }))
        .filter(Boolean); // Filter out undefined values
    yield Promise.all(downloadPromises)
        .then(() => console.log("All files downloaded successfully"))
        .catch((error) => console.error("Error occurred during download:", error));
});
exports.downloadS3Files = downloadS3Files;
