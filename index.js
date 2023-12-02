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
  // _id: String,
  username: String,
  description: String,
  duration: Number,
  date: String,
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
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
  // check if the request is a proper name
  if (!req.body.username) {
    return res.json({ status: "Invalid user" });
  } else {
    // check if the user already exists
    User.findOne({ username: req.body.username }).then((user) => {
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
app.post("/api/users/:_id/exercises", async (req, res) => {
  if (!req.params._id) res.json({ status: "Invalid request id" });

  if (!req.body.description || !req.body.duration)
    res.json({ status: "request descriptionp or duration missing..." });

  const user = await User.findById(req.params._id);
  if (!user) res.json({ status: "User not found" });

  console.log(user);
  // user.description = req.body.description;
  // user.duration = req.body.duration;
  // console.log(user);

  // UPDATE USER
  User.findByIdAndUpdate(req.params._id).then((user) => {
    const exerciseObject = {
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date
        ? new Date(req.body.date).toDateString()
        : new Date().toDateString(),
    };
    console.log(user);
    user = {
      ...user,
      ...exerciseObject,
      log: [...user.log, exerciseObject],
    };

    console.log("user after update");
    console.log(user);
    user
      .save()
      .then((user) => {
        res
          .json({
            _id: user._id,
            username: user.username,
            description: user.description,
            duration: user.duration,
            date: user.date,
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
        res.json({ status: "User not found" });
      });
  });
  // const exercise = new Exercise({
  //   username: user.username,
  //   description: req.body.description,
  //   duration: req.body.duration,
  //   date: req.body.date
  //     ? new Date(req.body.date).toDateString()
  //     : new Date().toDateString(),
  //   _id: req.params._id,
  // });

  // console.log("Exercise");
  // console.log(exercise);

  // exercise
  //   .save()
  //   .then((exercise) => {
  //     res.json(exercise);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     return res.json({ status: "Invalid request body" });
  //   });
});
