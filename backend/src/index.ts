import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import appRouter from "./routes/index.js";
import mongoose from "mongoose";
config();
const app = express();
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log("Server is listening on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

//middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rami-saas-ai-chatbot.vercel.app/api",
    ],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api", appRouter);

export default app;
