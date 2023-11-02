var express = require("express");
var router = express.Router();
require("../models/connection");
const Genre = require("../models/genre");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//GET genre: renvoie tous les genres
// recherche tous les genres dans le BDD => result JSON : réponse 'true" + les données des genres
router.get("/genre", (req, res) => {
  Genre.find().then(data => {
    res.json({ result: true, genre: data });
  });
});

// PUT GENRE DATA
// POST => création d'une histoire => nouvelle instance créée du modèle genre + sauvegarde BDD + réponse format JSON True
router.post("/genre", (req, res) => {
  const newGenre = new Genre({
    genre: req.body.genre,
    image: req.body.image,
    description: req.body.description,
    music: req.body.music,
  });

  // Save to MongoDB
  newGenre.save().then(newDoc => {
    res.json({ result: true });
  });
});

module.exports = router;
