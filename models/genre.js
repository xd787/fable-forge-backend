const mongoose = require('mongoose');

const genreSchema = mongoose.Schema({
    genre: String,
    image: String,
    description: String,
    music: String,
});

const Genre = mongoose.model('genres', genreSchema);

module.exports = Genre;
