import express from "express";
import mongoose from "mongoose";
import "dotenv-flow/config";

const app = express();

// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  next();
});

// routes

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log(`Connected to db & listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Database connection failed: ${error.message}`);
  });

export default app;
