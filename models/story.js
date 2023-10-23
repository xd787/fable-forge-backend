const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
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
});

const Story = mongoose.model('stories', storySchema);

module.exports = Story;

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
