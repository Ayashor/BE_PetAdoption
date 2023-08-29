const User = require('../../server/models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Signup
const checkExistingEmail = async (request, response, next) => {
    try {
      const { email } = request.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response.status(409).json({ message: 'User with this email already exists' });
      }
      next();
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: 'Server error' });
    }
};
//Login
// Middleware function to check if the user exists
const checkUserExistence = async (req, res, next) => {
  try {
    const userArray = await User.find({ email: req.body.email });
    const dbUser = userArray[0];
    if (!dbUser) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
    req.dbUser = dbUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error checking user existence" });
    return;
  }
};

// Middleware function to compare the password
const comparePassword = async (req, res, next) => {
  try {
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      req.dbUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error comparing passwords" });
  }
};

// Middleware function to sign the JWT token
const signToken = (req, res) => {
  const payload = {
    id: req.dbUser._id,
    email: req.dbUser.email,
    name: req.dbUser.firstName,
  };
  const token = jwt.sign(payload, process.env.SECRET, {
    expiresIn: 604800,
  });
  res.json({
    message: "Success",
    token: token,
    payload: payload,
    isLoggedIn: true,
  });
};

//Verify Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.SECRET);
    req.decoded = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};




module.exports =  { checkExistingEmail , checkUserExistence, comparePassword, signToken, verifyToken };
