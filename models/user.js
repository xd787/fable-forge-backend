const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
// A FAIRE 
});

const User = mongoose.model('users', userSchema);

module.exports = User;

// firstname: String 
// username: String
// Email: String 
// Password: String
// Token: String 
// Histoires : [clé étrangères]

// Abonnement: Booléen 
// Moyen de paiement: String
