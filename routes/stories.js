var express = require("express");
var router = express.Router();
require("../models/connection");
const Stories = require("../models/story");
const User = require("../models/user");
const uid2 = require("uid2");

//DELETE histoire selon l’ID de l’histoire
router.delete("/:storyID/:token", (req, res) => {
  Stories.deleteOne({ _id: req.params.storyID }).then((deletedDoc) => {
    if (deletedDoc.deletedCount > 0) {
      User.updateOne({ token: req.params.token },{ $pull: { stories: req.params.storyID } })
        .then((data) => {
          res.json({ result: true});
        });

    } else {
      res.json({ result: false, error: "Story not found" });
    }
  });
});


//POST poster une histoire selon l’utilisateur
router.post("/new/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => {
    if (data) {
      const newStory = new Stories({
        interactivity: false,
        length: req.body.length,
        title: req.body.title,
        endingType: req.body.ending,
        character: {
          characterName: null,
          characterPersonality: [],
          characterDescription: null,
          characterImage: null,
        },
        departureLocation: req.body.startPlace,
        user: data._id,
        completed: false,
        image: null,
        choicePrompt: [{ choiceText: null }],
      });

      newStory.save().then((newDoc) => {
        User.updateOne(
          { token: req.params.token },
          { $push: { stories: newDoc._id } }
        ).then((data) => {
          res.json({ result: true, token: newDoc.token });
        });
      });
    }
  });
});



//PUT modifier une histoire selon l’ID de l’histoire + ID du choix (ou index)
router.put("/:id", (req, res) => {
  Stories.updateOne(
    { _id: req.params.id },
    {
      interactivity: false,
      length: req.body.length,
      title: req.body.title,
      endingType: req.body.ending,
      character: {
        characterName: null,
        characterPersonality: [],
        characterDescription: null,
        characterImage: null,
      },
      departureLocation: req.body.startPlace,
      completed: false,
      image: null,
      choicePrompt: [{ choiceText: null }],
    }
  ).then((data) => {
    res.json({ data });
  });
});


//GET une histoire spécifique
router.get("/:id", (req, res) => {
  Stories.findOne({ _id: req.params.id })
    .populate("user")
    .then((data) => {
      if (data) {
        res.json({ result: true, story: data });
      } else {
        res.json({ result: "No Story found" });
      }
    });
});

module.exports = router;
