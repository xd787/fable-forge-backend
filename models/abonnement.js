const mongoose = require('mongoose');

const abonnementSchema = mongoose.Schema({
// A FAIRE 
});

const Abonnement = mongoose.model('abonnements', abonnementSchema);

module.exports = Abonnement;

// nom de l’abonnement: String
// prix de l’abonnement: Number
// utilisateurs qui sont abonnés à cet abonnement: clé étrangère 
// récurrence de paiement (hebdo, mensuel, annuel): String
// date de début d’abonnement: String
