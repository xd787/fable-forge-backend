const mongoose = require("mongoose");

// Schema qui définit les propriétés et les types de données d'un document mongoDB
const genreSchema = mongoose.Schema({
  genre: String,
  image: String,
  description: String,
  music: String,
});

// Création du modèle "genre" => nom + schema à utiliser
const Genre = mongoose.model("genres", genreSchema);

//export du schema pour l'importer ensuite
module.exports = Genre;
