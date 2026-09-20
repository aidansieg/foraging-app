import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { spotsRouter } from "./routes/spots";
import { speciesRouter } from "./routes/species";
import { findsRouter } from "./routes/finds";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendOrigin }));

app.use(healthRouter);
app.use(authRouter);
app.use(spotsRouter);
app.use(speciesRouter);
app.use(findsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`ForageCast backend listening on http://localhost:${config.port}`);
});
