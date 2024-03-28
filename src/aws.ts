import { env } from "./env";
import fs from "fs";
import path from "path";
import { getAllFiles, getOutputDir } from "./utils";
import { mkdir, writeFile } from "fs/promises";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Check if the upload service is AWS
const uploadService = env.UPLOAD_SERVICE === "aws" ? true : false;

// Initialize S3 client
const s3 = new S3Client([
  {
    region: uploadService ? env.AWS_REGION : "auto",
    endpoint: uploadService ? undefined : env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: uploadService
        ? env.AWS_ACCESS_KEY_ID
        : env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: uploadService
        ? env.AWS_SECRET_ACCESS_KEY
        : env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
    // debug: true, // Enable debugging
  },
]);

// Convert stream to string
const streamToString = (stream: Readable) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export const downloadS3Files = async (id: string) => {
  console.log("Download started");

  const prefix = `output/${id}`; // Adjust the prefix dynamically
  console.log("Prefix:", prefix);

  // Configure S3 parameters
  const params = {
    Bucket: env.BUCKET_NAME,
    Prefix: prefix,
  };

  // Get list of all specified files
  const getListAllFiles = await s3.send(new ListObjectsV2Command(params));

  // Create a directory to save downloaded files
  const outputDir = getOutputDir();
  await mkdir(outputDir, { recursive: true }); // Ensure the directory is created

  // Download each file asynchronously
  const downloadPromises = (getListAllFiles.Contents || [])
    .map(async (object) => {
      // console.log("Object:", object);
      if (object?.Key) {
        const objectKey = object.Key;
        const commandGet = new GetObjectCommand({
          Bucket: env.BUCKET_NAME,
          Key: objectKey,
        });

        try {
          const { Body } = await s3.send(commandGet);

          // Ensure the directory structure exists for the file
          const dirPath = path.dirname(objectKey);
          await mkdir(dirPath, { recursive: true });

          // Finish saving the files to the output directory
          const bodyContents = await streamToString(Body as Readable);
          return writeFile(objectKey, bodyContents);
        } catch (error) {
          console.error("Error occurred while downloading:", error);
        }
      }
    })
    .filter(Boolean); // Filter out undefined values

  await Promise.all(downloadPromises)
    .then(() => console.log("All files downloaded successfully"))
    .catch((error) => console.error("Error occurred during download:", error));
};

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("Stared uploading file to S3");

  // Create a readable stream from the local file
  const fileStream = fs.createReadStream(localFilePath);

  // Configure S3 parameters
  const params = {
    Bucket: env.BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  };

  const command = new PutObjectCommand(params);

  // Upload the file asynchronously
  try {
    const response = await s3.send(command);
    console.log(response);
    if (response) {
      console.log("File uploaded successfully");
    } else {
      console.log("Error occurred while uploading the file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw the error for handling upstream
  }
};

export const uploadFinalDist = async (id: string) => {
  // Get all files in the dist folder
  const folderPath = path.join(getOutputDir(), `${id}/dist`);
  const allFiles = getAllFiles(folderPath);

  // Upload each file to S3
  allFiles.forEach(async (file) => {
    // Get the file name
    const filePath = `dist/${file
      .slice(getOutputDir().length + 1)
      .replace("dist/", "")}`;
    console.log("File path:", file);
    console.log("Uploading fileName:", filePath);

    // Upload the file to S3
    uploadFile(filePath, file);
  });
};
