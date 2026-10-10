// app.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./routes/index.js";

const app = Fastify({ logger: true });

app.register(cors, {
	origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:4321",
});
app.register(routes, { prefix: "/api" });

export default app;