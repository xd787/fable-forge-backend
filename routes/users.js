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
        histoires: [],
        abonnement: false,
        payment: null,
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
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
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
  User.deleteOne({token: req.body.token }).then((deletedDoc) => {
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
    {token: req.body.token },
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

router.get("/lastStory", (req, res) => {
  User.findOne({ token: req.body.token }).then((data) => {
    res.json({ result: true, stories: data.stories });
  });
});

//GET toutes les histoires selon l’utilisateur
router.get("/stories", (req, res) => {
  User.findOne({ token: req.body.token }).then((data) => {
    res.json({ result: true, stories: data.stories });
  });
});

module.exports = router;
