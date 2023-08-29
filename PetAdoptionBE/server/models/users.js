const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {type: String, required: true},
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    isAdmin: { type: Boolean, required: false, default: false },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);