"use strict";
// import express, { Request, Response } from "express";
// import path from "path";
// import logger from "morgan";
// import cors from "cors";
// import { env } from "./env";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const aws_1 = require("./aws");
const redis = (0, redis_1.createClient)().on("error", (err) => console.log("Redis Client Error", err));
redis.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Listening for build-queue events");
        while (true) {
            const response = yield redis.brPop((0, redis_1.commandOptions)({ isolated: true }), "build-queue", 0);
            console.log(response === null || response === void 0 ? void 0 : response.element);
            if (!(response === null || response === void 0 ? void 0 : response.element)) {
                console.log("Key doesn't exist");
                continue;
            }
            // const id = response?.element;
            // const id = env.UPLOAD_SERVICE === "aws" ? "j3uprnwj" : "42d4iili";
            const id = response.element;
            console.log("ID:", id);
            // const files = await downloadS3Files(`output/${id}/`);
            yield (0, aws_1.downloadS3Files)(id);
        }
    });
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
