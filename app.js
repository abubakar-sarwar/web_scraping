import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDatabase from "./connection.js";
import JobRoutes from "./routes/jobs.routes.js";

// dotEnv Configuration
dotenv.config();

const app = express();

// JSON Configuration
app.use(express.json());

// Cors Configuration
app.use(cors());

// Mongoose Connection
connectToDatabase();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Sracpping." });
});

// API's routes
app.use("/scrapping/api", JobRoutes);

// Listening to a server
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
