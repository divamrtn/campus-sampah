import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { appConfig } from "./config/app.config.js";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // agar req.ip benar di belakang reverse proxy
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: appConfig.jsonLimit }));
if (env.NODE_ENV !== "test") app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(appConfig.apiPrefix, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
