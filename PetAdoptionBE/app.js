const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const petsRouter = require('./server/controllers/pet.js');
const usersRouter = require('./server/controllers/user.js');

mongoose.set('strictQuery', false);


//This function connects to the database using the URI provided in the .env file.
mongoose.connect(config.MONGODB_URI).then(() => {
    console.log('connected to MongoDB');
    })
    .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
});

app.use(cors());
app.use(express.json());
app.use(express.static('build'));


//This is our base route. It returns all the pets in the database as json.
app.use('/api/all-pets', petsRouter);

//This is our base route. It returns all the users in the database as json.
app.use('/api/all-users', usersRouter);


module.exports = app;