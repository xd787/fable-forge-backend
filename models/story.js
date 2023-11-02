const mongoose = require("mongoose");

// Schema pour personnaliser le personnage à créer avec 4 propriétés
const characterSchema = mongoose.Schema({
  characterName: String,
  characterPersonality: [String],
  characterDescription: String,
  characterImage: String,
});

// schema de personnalisation de l'histoire
const storySchema = mongoose.Schema({
  interactivity: Boolean,
  length: String,
  title: String,
  type: String,
  endingType: String,
  character: characterSchema, //Sous document - character
  departureLocation: String,
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }], //clé étrangère
  completed: Boolean,
  image: String,
  choicePrompt: [], //Sous document - choice
});

// Création du modèle "story" => nom + schema à utiliser
const Story = mongoose.model("stories", storySchema);

module.exports = Story;
