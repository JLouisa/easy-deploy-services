import {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { env } from "./env";
import fs from "fs";

const s3 = new S3Client({
  region: "auto",
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const downloadS3Files = async (id: string) => {
  console.log("Called");

  const prefix = `output/${id}/`; // Adjust the prefix dynamically

  // Configure S3 parameters
  const params = {
    Bucket: env.BUCKET_NAME,
    Key: prefix,
    // Delimiter: "/", // Set the delimiter to "/"
  };

  const command = new ListObjectsCommand(params);

  try {
    // Get list of all specified files
    const getAllFiles = await s3.send(command);
    const files = getAllFiles?.Contents?.map((object) => object.Key);
    console.log(files);

    return files;
  } catch (error) {
    console.error("Error listing files in bucket:", error);
    throw error;
  }
};
