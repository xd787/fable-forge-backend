const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    subscriptionName: String,
    subscriptionPrice: Number,
    subscribers: , //clé étrangère
    subscriptionFrequency: String, //hebdomadaire, mensuel, annuel
    subscriptionStartDate: Date,
});

const Subscription = mongoose.model('subscriptions', subscriptionSchema);

module.exports = Subscription;

