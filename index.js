require("dotenv").config();
const { client } = require("./db");

const PORT = 3000;
const express = require("express");
const server = express();
const path = require("path"); // Import the 'path' module
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Set EJS as the view engine
server.set("view engine", "ejs");

// Specify the views directory
server.set("views", path.join(__dirname, "views"));

// Middleware
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(express.static(path.join(__dirname, "public")));
// GET route to display the user registration form
server.get("/register", (req, res) => {
  // You can send the 'register.html' file as a response
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

server.get("/login", (req, res) => {
  // You can send the 'login.html' file as a response
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

server.get("/success", (req, res) => {
  // You can send the 'login.html' file as a response
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

server.get('/', (req, res) => {
  res.json("Server is Running ....")
})
const bodyParser = require("body-parser");
server.use(bodyParser.json());

const morgan = require("morgan");
server.use(morgan("dev"));

// server.use((req, res, next) => {
//   console.log("<____Body Logger START____>");
//   console.log(req.body);
//   console.log("<_____Body Logger END_____>");

//   next();
// });

const apiRouter = require("./api");
server.use("/api", apiRouter);

client
  .connect()
  .then(() => {
    console.log("Connected to the database!");
    // You can now execute your database queries here
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
