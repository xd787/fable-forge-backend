var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/user");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// POST INSCRIPTION
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Check if the user does not already exist in data base
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        stories: [], // tableau de ID stories
        subscription: {
          subscriber: false,
          subscriptionName: null,
          subscriptionPrice: 0,
          subscriptionFrequency: null, //hebdomadaire, mensuel, annuel
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(),
        },
        paymentMethod: null,
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//POST CONNECTION
router.post("/signin", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  const isEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      identifier
    );

  User.findOne(isEmail ? { email: identifier } : { username: identifier }).then(data => {
    if (data && bcrypt.compareSync(password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        username: data.username,
        firstname: data.firstname,
        email: data.email,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

//DELETE suppression de compte
router.delete("/", (req, res) => {
  User.deleteOne({ token: req.body.token }).then(deletedDoc => {
    if (deletedDoc.deletedCount > 0) {
      // User successfully deleted
      User.find().then(data => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

// //PUT modifier les infos user
// router.put("/information", (req, res) => {
//   User.updateOne(
//     { token: req.body.token },
//     {
//       username: req.body.username,
//       firstname: req.body.firstname,
//       email: req.body.email,
//     }
//   ).then((data) => {
//     res.json({result: "User information updated successfully"  });
//   });
// });

router.put("/information", async (req, res) => {
  try {
    const { token, email, firstname, username } = req.body;

    // Find the user using the provided token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's information
    user.email = email;
    user.firstname = firstname;
    user.username = username;

    // Save the updated user
    await user.save();

    res.json({ result: "User information updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "User information update failed" });
  }
});

// PUT route to update a user's password
router.put("/password", (req, res) => {
  const { token, oldPassword, newPassword } = req.body;
  // First, find the user based on the provided token
  User.findOne({ token: token }).then(user => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }

    // Verify the old password
    if (bcrypt.compareSync(oldPassword, user.password)) {
      // Hash the new password
      const hash = bcrypt.hashSync(newPassword, 10);
      // Update the user's password
      User.updateOne({ token: token }, { password: hash })
        .then(() => {
          res.json({ result: true, message: "Password updated successfully" });
        })
        .catch(error => {
          res.json({ result: false, error: "Password update failed" });
        });
    } else {
      res.json({ result: false, error: "Wrong password" });
    }
  });
});

//GET avoir la dernière histoire
router.get("/lastStory/:token", (req, res) => {
  User.findOne({ token: req.params.token })
    .populate("stories")
    .then(data => {
      let lastStories = data.stories[data.stories.length - 1];
      res.json({ result: true, stories: lastStories });
    });
});

//GET toutes les histoires selon l’utilisateur
router.get("/stories/:token", (req, res) => {
  User.findOne({ token: req.params.token })
    .populate("stories")
    .then(data => {
      res.json({ result: true, stories: data.stories });
    });
});

module.exports = router;
