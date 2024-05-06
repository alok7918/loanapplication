import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from "./routes/authRouter.js";
import loanRouter from "./routes/loanRouter.js";

const app = express();
app.use(cors()); 

app.use(express.json());
const CONNECTION_URL = process.env.MONGODB_URI;
const PORT = process.env.PORT 

// Connect to MongoDB
mongoose
  .connect(CONNECTION_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error(err));


  app.use("/auth", authRouter);
  app.use("/loans", loanRouter);

app.listen(PORT, () => {
  console.log(`App is listening to port ${PORT}`);
});
