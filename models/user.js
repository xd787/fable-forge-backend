const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    subscriber: Boolean,
    subscriptionName: String,
    subscriptionPrice: Number,
    subscriptionFrequency: String, //hebdomadaire, mensuel, annuel
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
});

const userSchema = mongoose.Schema({
    firstname: String,
    username: String,
    email: String, 
    password: String,
    token: String,
    stories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'stories' }], //clé étrangère stories
    subscription: subscriptionSchema, //sous-document subscription
    paymentMethod: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;

