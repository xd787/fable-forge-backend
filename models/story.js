const mongoose = require('mongoose');

const characterSchema = mongoose.Schema({
    characterName: String,
    characterPersonality: [String],
    characterDescription: String,
    characterImage: String,
});

const choiceSchema = mongoose.Schema({
    choiceText: String,
});

const storySchema = mongoose.Schema({
    interactivity: Boolean,
    length: String,
    title: String,
    type: String,
    endingType: String,
    character: characterSchema, //Sous document - character
    departureLocation: String,
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], //clé étrangère
    completed: Boolean,
    image: String,
    choicePrompt: [], //Sous document - choice
});

const Story = mongoose.model('stories', storySchema);

module.exports = Story;


