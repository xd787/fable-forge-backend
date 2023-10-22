const mongoose = require('mongoose');

const storieSchema = mongoose.Schema({
// A FAIRE 
});

const Storie = mongoose.model('stories', storieSchema);

module.exports = Storie;

// Intéractif/ pas interactif : Booléen 
// Longueur : String 
// Titre : String
// Type de fin : String 
// Personnage : Sous document
// Lieu de départ : String (null)
// User : ID doc 
// Histoire : Token 
// Histoire terminée : (oui/ non): Booléen
// Image : String
// Prompt : Array de Choix

// Sous document - Choix : 
// Pour chaque choix : id et texte 

// Sous document - Personnage :
// Nom du personnage : String
// Caractéristiques : Array de String
// Description : String
// Image : String
