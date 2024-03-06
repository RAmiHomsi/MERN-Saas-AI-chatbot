import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import appRouter from "./routes";
config();
const app = express();

//middlewares
app.use(
  cors({
    origin: [
      "https://rami-saas-ai-chatbot.vercel.app/api",
      "https://rami-saas-ai-chatbot.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api", appRouter);

export default app;
