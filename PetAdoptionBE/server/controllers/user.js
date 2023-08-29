const usersRouter = require('express').Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkExistingEmail , checkUserExistence , comparePassword , signToken, verifyToken } = require('../../utils/MiddleWare/usersMiddleware.js');

//All
usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

//Signup
usersRouter.post('/', checkExistingEmail, async (request, response) => {
  try {
    const userData = request.body;
    const saltRounds = 10;
    const password = userData.password;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: hash,
        confirmPassword: hash,
      });

      await user.save();

      const payload = {
        id: user._id,
        email: user.email,
        name: user.firstName,
      };

      const token = await jwt.sign(payload, process.env.SECRET, {
        expiresIn: 86400,
      });

      response.status(200).json({
        message: "Success",
        token: token,
        payload: payload,
        userData: user,
        isLoggedIn: true,
      });
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error' });
  }
});

//Login
usersRouter.post('/login', checkUserExistence, comparePassword, signToken);

//CurrentUser
usersRouter.get('/currentUser', verifyToken, async (request, response) => {
  try {
    const { userId } = request.query;
    const user = await User.findById(userId);
    response.status(200).json(user);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error' });
  }
});

//Update Personal Details
usersRouter.put('/updatePersonalDetails', verifyToken, async (request, response) => {
  try {
    const { userId } = request.query;
    const { firstName, lastName, phone, email } = request.body.userData;
    const user = await User.findById(userId);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) user.email = email; 
    await user.save();
    response.status(200).json({user, isLoggedIn: true});
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error' });
  }
});

//Update Password
usersRouter.put('/updatePassword', verifyToken, async (request, response) => {
  try {
    const { userId } = request.query;
    const { userData } = request.body;
    const saltRounds = 10;
    const password = userData.password;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const user = await User.findById(userId);
      user.password = hash;
      user.confirmPassword = hash;
      await user.save();
      response.status(200).json({user});
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Server error' });
  }
});




module.exports = usersRouter;