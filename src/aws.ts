import {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { env } from "./env";
import fs from "fs";

const uploadService = env.UPLOAD_SERVICE === "aws" ? true : false;

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

export const downloadS3Files = async (id: string) => {
  console.log("Called");

  const prefix = `output/${id}`; // Adjust the prefix dynamically
  console.log("Prefix:", prefix);

  // Configure S3 parameters
  const params = {
    Bucket: env.BUCKET_NAME,
    Prefix: prefix,
  };

  const command = new ListObjectsV2Command(params);

  try {
    // Get list of all specified files
    const getAllFiles = await s3.send(command);
    // console.log("Files:", getAllFiles);
    const files = getAllFiles?.Contents?.map((object) => object.Key);
    console.log(files);
  } catch (error) {
    console.error("Error listing files in bucket:", error);
    throw error;
  }
};
