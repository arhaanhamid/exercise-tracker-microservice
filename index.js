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

//USER schema and model
const userSchema = new mongoose.Schema({
  username: String,
});

const User = mongoose.model("User", userSchema);

//EXERCISE schema and model
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: String,
  date: String,
  _id: String,
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// create a new user
app.post("/api/users", (req, res) => {
  // check if the request is a proper name
  if (!req.body.username) {
    return res.json({ status: "Invalid user" });
  } else {
    // check if the user already exists
    User.findOne({ user: req.body.username }).then((user) => {
      // create a new user if not exists
      if (!user) {
        const newUser = new User({ username: req.body.username });
        newUser
          .save()
          .then((user) => {
            res.json({
              username: user.username,
              _id: user._id,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        // if already exists
        return res.json({ status: "User already exists" });
      }
    });
  }
});

// getting all user from the database
app.get("/api/users", (req, res) => {
  User.find({})
    .select("username _id")
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res.status(error.status);
    });
});

// adding data to users exercise
app.post("/api/users/:_id/exercise", async (req, res) => {
  console.log(req.params._id);
  if (!req.params._id) res.json({ status: "Invalid request" });
  const username = await User.findOne({ _id: req.params._id }).select(
    "username"
  ).username;
  console.log(username);

  console.log(req.body);
  if (!req.body.description || !req.body.duration) {
    return res.json({ status: "Invalid request" });
  }

  const exercise = new Exercise({
    username: username,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? req.body.date : new Date(),
    _id: req.params._id,
  });

  exercise
    .save()
    .then((exercise) => {
      res.json(exercise);
    })
    .catch((err) => {
      res.json({ status: "Invalid request" });
    });
});
