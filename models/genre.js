const mongoose = require('mongoose');

const baseGenreSchema = mongoose.Schema({
// A FAIRE 
});

const BaseGenre = mongoose.model('baseGenre', baseGenreSchema);

module.exports = BaseGenre;

// nom du genre: String 
// Image du genre: String 
// descriptif du genre: String 
// Musique: String
