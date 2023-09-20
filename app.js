const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const fileFilter = require("./util/fileFilter");
const username = require("./util/credentials").username;
const password = require("./util/credentials").password;

const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/social`;

const app = express();

// Multer config
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

app.use((req, res, next) => {
  // Fix CORS error
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(bodyParser.json()); // parse application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
); // parse multipart/form-data (file upload)
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
