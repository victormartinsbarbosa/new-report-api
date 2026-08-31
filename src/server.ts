import Fastify from "fastify";
import cors from "@fastify/cors";
import { handleAuthRequest } from "./lib/auth-adapter.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});

app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.all("/api/auth/*", handleAuthRequest);

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
