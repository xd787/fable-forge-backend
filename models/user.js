const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: String,
    username: String,
    email: String, 
    password: String,
    token: String,
    stories : [], // clé étrangère

    subscription: Boolean, 
    paymentMethod: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;

