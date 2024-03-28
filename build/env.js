"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zennv_1 = __importDefault(require("zennv"));
const zod_1 = __importDefault(require("zod"));
const envSchema = zod_1.default.object({
    PORT: zod_1.default.number().default(3000),
    UPLOAD_SERVICE: zod_1.default.string(),
    BUCKET_NAME: zod_1.default.string(),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: zod_1.default.string(),
    CLOUDFLARE_R2_ACCESS_KEY_ID: zod_1.default.string(),
    CLOUDFLARE_R2_TOKEN_VALUE: zod_1.default.string(),
    CLOUDFLARE_R2_ENDPOINT: zod_1.default.string(),
    CLOUDFLARE_R2_EU_ENDPOINT: zod_1.default.string(),
    AWS_SECRET_ACCESS_KEY: zod_1.default.string(),
    AWS_ACCESS_KEY_ID: zod_1.default.string(),
    AWS_REGION: zod_1.default.string(),
});
exports.env = (0, zennv_1.default)({
    dotenv: true,
    schema: envSchema,
});
