import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendOrigin }));
app.use(healthRouter);
app.use(authRouter);

app.listen(config.port, () => {
  console.log(`ForageCast backend listening on http://localhost:${config.port}`);
});
