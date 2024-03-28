// import express, { Request, Response } from "express";
// import path from "path";
// import logger from "morgan";
// import cors from "cors";
// import { env } from "./env";

// import { generate, getOutputDir } from "./utils";
// import { getAllFiles } from "./file";
// import { uploadFile } from "./aws";

import { env } from "./env";

import { commandOptions, createClient } from "redis";
import { downloadS3Files } from "./aws";

const redis = createClient().on("error", (err) =>
  console.log("Redis Client Error", err)
);
redis.connect();

async function main() {
  console.log("Listening for build-queue events");

  while (true) {
    const response = await redis.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    console.log(response?.element);
    if (!response?.element) {
      console.log("Key doesn't exist");
      continue;
    }

    // const id = response?.element;
    // const id = env.UPLOAD_SERVICE === "aws" ? "j3uprnwj" : "42d4iili";
    const id = response.element;
    console.log("ID:", id);

    // const files = await downloadS3Files(`output/${id}/`);
    await downloadS3Files(id);
  }
}

main();

// // Create Express server.
// const app = express();

// // Middleware
// app.use(logger("dev"));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public")));

// // Routes
// app.get("/", (req: Request, res: Response) => {
//   res.send("Express + TypeScript Server");
// });

// // Start Express server.
// app.listen(env.PORT, () => {
//   console.log(`Server running on port ${env.PORT}`);
// });
