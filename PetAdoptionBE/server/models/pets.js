//Models are used for creating schemas for the backend database
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const petSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    adoptionStatus: { type: String, required: true },
    picture: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    color: { type: String, required: true },
    bio: { type: String, required: true },
    hypoallergenic: { type: Boolean, required: true },
    dietaryRestrictions: { type: String, required: true },
    breed: { type: String, required: true },
    savedByUsers: [{ type: String, required: false }],
    fosteredByUser: [{ type: String, required: false }],
    adoptedByUser: [{ type: String, required: false }],
});

petSchema.plugin(uniqueValidator);
// This makes it so that you can't have two of the same of the same things in your database. You can set unique=true to make someething not be able to be added to the database if it already exists.

module.exports = mongoose.model('Pet', petSchema);