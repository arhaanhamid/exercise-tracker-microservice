const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI).then(() => {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const userSchema = new mongoose.Schema({
  username: String,
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// create a new user
app.post("/api/users", (req, res) => {
  if (!req.body.username) {
    return res.json({ status: "Invalid user" });
  } else {
    User.findOne({ user: req.body.username }).then((user) => {
      if (!user) {
        const newUser = new User({ username: req.body.username });
        newUser
          .save()
          .then((user) => {
            res.json({
              status: "User created with username: " + user.username,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return res.json({ status: "User already exists" });
      }
    });
  }
});
