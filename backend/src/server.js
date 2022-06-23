"use strict";
const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./Routes/Users");
const quizzesRoute = require("./Routes/Quizzes");

app.use(express.static(path.join(__dirname, "/public/")));

// Middleware
app.use(express.json());
app.use("/API/users", userRoute);
app.use("/API/quizzes", quizzesRoute);

// app.use(express.static(path.join(__dirname, 'build')));

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
});
// Listening to APIs
app.listen(process.env.PORT || 3080, () =>
  console.log("Listening on Port 3080")
);
