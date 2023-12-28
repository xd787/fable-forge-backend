var express = require("express");
var router = express.Router();
require("../models/connection");
const Stories = require("../models/story");
const User = require("../models/user");
const uid2 = require("uid2");

const fetch = require("node-fetch");
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

//DELETE histoire selon l’ID de l’histoire
router.delete("/:storyID", (req, res) => {
  Stories.deleteOne({ _id: req.params.storyID }).then(deletedDoc => {
    if (deletedDoc.deletedCount > 0) {
      User.updateOne({ token: req.body.token }, { $pull: { stories: req.params.storyID } }).then(data => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: "Story not found" });
    }
  })
});

//POST poster une histoire selon l’utilisateur
router.post("/new/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then(data => {
    if (data) {
      const newStory = new Stories({
        interactivity: false,
        length: req.body.length,
        title: req.body.title,
        type: req.body.type,
        endingType: req.body.ending,
        character: {
          characterName: null,
          characterPersonality: [],
          characterDescription: null,
          characterImage: null,
        },
        departureLocation: null,
        user: data._id,
        completed: false,
        image: null,
        choicePrompt: req.body.story,
      });

      // Save story to mongoDB
      newStory.save().then(newDoc => {
        User.updateOne({ token: req.params.token }, { $push: { stories: newDoc._id } }).then(data => {
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
  ).then(data => {
    res.json({ data });
  });
});

//GET une histoire spécifique
// Recherche en BDD, si l'histoire existe, renvoi "true" et l'histoire recherchée, sinon renvoie "no story found"
router.get("/:id", (req, res) => {
  Stories.findOne({ _id: req.params.id })
    .populate("user")
    .then(data => {
      if (data) {
        res.json({ result: true, story: data });
      } else {
        res.json({ result: "No Story found" });
      }
    });
});

// TEST PERSONNAGE 
// Endpoint pour recevoir les données du frontend
router.post('/persoCharacter', async (req, res) => {
  try {
    // Extraire les données de la requête
    const { selectedType, endingType } = req.body;

    // Construire la requête vers l'API externe
    const messageAPI = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "user",
          content: `Créer deux personnages pour une histoire de ${selectedType} avec une ${endingType} sans raconter leur histoire. Pour chaque personnage :\n\nPersonnage 1 :\nPrénom :\n2 Traits de caractère :\nCourte Description :\n\nPersonnage 2 :\nPrénom :\n2 Traits de caractère :\nCourte Description :`
        }
      ],
      max_tokens: 400
    };

    // Envoi de la requête à l'API externe
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(messageAPI),
    });

    // Traitement de la réponse de l'API externe
    const responseData = await response.json();

    // Extraction des données des personnages
    const characters = extractCharacterInfo(responseData);

    // Envoyer les données extraites vers le frontend
    res.status(200).json({ success: true, characters });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fonction pour extraire les données des personnages
const extractCharacterInfo = (responseData) => {
  const characterInfo = [];

  if (responseData && responseData.choices && responseData.choices.length > 0) {
    const charactersData = responseData.choices[0].message.content.split('\n\n');
    charactersData.forEach((character) => {
      const traits = character.match(/2 Traits de caractère : (\w+), (\w+)/);
      const description = character.match(/Courte Description : (.+)/);

      if (traits && description) {
        const [_, trait1, trait2] = traits;
        const [, characterDescription] = description;
        characterInfo.push({ traits: [trait1, trait2], description: characterDescription });
      }
    });
  }

  return characterInfo;
};

module.exports = router;
