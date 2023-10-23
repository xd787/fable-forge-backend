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
  User.findOne({ username: req.body.username }).then((data) => {
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

      newUser.save().then((newDoc) => {
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

  User.findOne(
    isEmail ? { email: identifier } : { username: identifier }
  ).then((data) => {
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
  User.deleteOne({ token: req.body.token }).then((deletedDoc) => {
    if (deletedDoc.deletedCount > 0) {
      // User successfully deleted
      User.find().then((data) => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});



//PUT modifier les infos user
router.put("/", (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  User.updateOne(
    { token: req.body.token },
    {
      firstname: req.body.firstname,
      username: req.body.username,
      email: req.body.email,
      password: hash,
    }
  ).then((data) => {
    res.json({ data });
  });
});


//GET avoir la dernière histoire
router.get("/lastStory/:token", (req, res) => {
  User.findOne({ token: req.params.token })
  .populate('stories')
  .then((data) => {
    let lastStories = data.stories[data.stories.length -1]
    res.json({ result: true, stories: lastStories });
  });
});


//GET toutes les histoires selon l’utilisateur
router.get("/stories/:token", (req, res) => {
  User.findOne({ token: req.params.token })
  .populate('stories')
  .then((data) => {
    res.json({ result: true, stories: data.stories });
  });
});


// put abonnement
// router.put("/subscription", (req, res) => {
//   User.findOne({ token: req.body.token }).then((data) => {
//     res.json({ result: true, abonnement: data });
//   });
// });

module.exports = router;
