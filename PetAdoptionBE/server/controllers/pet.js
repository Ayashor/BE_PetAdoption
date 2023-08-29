//Controllers are the glue between the models and the views. They contain the logic to query the models and pass the data to the views. In this case, we are querying the Pet model and passing the data to the view to be rendered.
const petsRouter = require('express').Router();
const path = require('path');
const { verifyToken } = require('../../utils/MiddleWare/usersMiddleware');
const Pet = require('../models/pets');
const User = require('../models/users');
const { upload } = require('../../utils/MiddleWare/petsMiddleWare');
const { cloudinary } = require('../../utils/config');

//All
petsRouter.get('/', async (request, response) => {
    const pets = await Pet.find({});
    response.status(200).json(pets);
});

//Search
petsRouter.get('/search', async (request, response) => {
    try {
      const { type, status: adoptionStatus, height, weight, name } = request.query;
      let typeQuery;
      if (type === 'other') {
        typeQuery = { $not: { $in: ['cat', 'dog'] } };
      } else {
        typeQuery = type;
      }
      let weightQuery;
      if (weight === '0-20') {
        weightQuery = { $lte: 20 };
      } else if (weight === '21-40') {
        weightQuery = { $gte: 20, $lte: 40 };
      } else if (weight === '41-60') {
        weightQuery = { $gte: 41, $lte: 60 };
      } else if (weight === '61-80') {
        weightQuery = { $gte: 61, $lte: 80 };
      } else if (weight === '80 and above') {
        weightQuery = { $gte: 80 };
      }
      let heightQuery;
      if (height === '0-12') {
        heightQuery = { $lte: 12 };
      } else if (height === '13-24') {
        heightQuery = { $gte: 13, $lte: 24 };
      } else if (height === '25-36') {
        heightQuery = { $gte: 25, $lte: 36 };
      } else if (height === '37-48') {
        heightQuery = { $gte: 37, $lte: 48 };
      } else if (height === '49 and above') {
        heightQuery = { $gte: 49 };
      }
      const pets = await Pet.find({$or: [{type: typeQuery}, {adoptionStatus: adoptionStatus}, {height: heightQuery}, {weight: weightQuery}, {name}]});
      response.status(200).json(pets);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Internal server error' });
    }
});
petsRouter.get('/:type', async (request, response) => {
    const { type } = request.params;
    const pets = await Pet.find({ type });
    response.status(200).json(pets);
});

//Saved
petsRouter.put('/liked', verifyToken, async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const likedPet = await Pet.findById(petId);
    likedPet.savedByUsers.push(userId);
    await likedPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to save pet' });
  }
});
// API endpoint to get saved pets for a user
petsRouter.get('/saved/:userId', async (request, response) => {
  try {
    const userId = request.params.userId;
    const savedPets = await Pet.find({ savedByUsers: userId });
    response.status(200).json(savedPets);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to fetch saved pets' });
  }
});
//Unsave Pet
petsRouter.put('/unsave', async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const savedPet = await Pet.findById(petId);
    savedPet.savedByUsers = savedPet.savedByUsers.filter((user) => user !== userId);
    await savedPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    response.status(500).json({ error: 'Failed to unsave pet' }); 
  }
});

//Fostered
petsRouter.put('/fostered', async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const fosteredPet = await Pet.findById(petId);
    fosteredPet.fosteredByUser.push(userId);
    fosteredPet.adoptionStatus = 'Fostered';
    await fosteredPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to foster pet' });
  }
});
// API endpoint to get fostered pets for a user
petsRouter.get('/getFostered/:userId', async (request, response) => {
  try {
    const userId = request.params.userId;
    const fosteredPets = await Pet.find({ fosteredByUser: userId });
    response.status(200).json(fosteredPets);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to fetch fostered pets' });
  }
});
//Return Fostered Pet
petsRouter.put('/returnFostered', async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const fosteredPet = await Pet.findById(petId);
    fosteredPet.fosteredByUser = fosteredPet.fosteredByUser.filter((user) => user !== userId);
    fosteredPet.adoptionStatus = 'Available';
    await fosteredPet.save();
    response.status(200).json({ success: true });
    } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to return fostered pet' });
  }
});


//Adopted
petsRouter.put('/adopted', async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const adoptedPet = await Pet.findById(petId);
    adoptedPet.adoptedByUser.push(userId);
    adoptedPet.fosteredByUser = [];
    adoptedPet.adoptionStatus = 'Adopted';
    await adoptedPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to adopt pet' });
  }
});

//Return Adopted Pet
petsRouter.put('/returnAdopted', async (request, response) => {
  try {
    const petId = request.body.petId;
    const userId = request.body.userId;
    const adoptedPet = await Pet.findById(petId);
    adoptedPet.adoptedByUser = adoptedPet.adoptedByUser.filter((user) => user !== userId);
    adoptedPet.adoptionStatus = 'Available';
    await adoptedPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to return adopted pet' });
  }
});

//Get adopted pets for a user
petsRouter.get('/getAdopted/:userId', async (request, response) => {
  try {
    const userId = request.params.userId;
    const adoptedPets = await Pet.find({ adoptedByUser: userId });
    response.status(200).json(adoptedPets);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to fetch adopted pets' });
  }
});

//Update Pet
petsRouter.put('/update/:petId', async (request, response) => {
  try {
    const petId = request.params.petId;
    const updatedData = request.body;
    const updatedPet = await Pet.findById(petId);
    if (updatedData.name) updatedPet.name = updatedData.name; 
    if (updatedData.type) updatedPet.type = updatedData.type; 
    if (updatedData.color) updatedPet.color = updatedData.color;
    if (updatedData.breed) updatedPet.breed = updatedData.breed;
    if (updatedData.bio) updatedPet.bio = updatedData.bio;
    if (updatedData.height) updatedPet.height = updatedData.height;
    if (updatedData.weight) updatedPet.weight = updatedData.weight;
    if (updatedData.status) updatedPet.adoptionStatus = updatedData.status;
    if (updatedData.hypoallergenic) updatedPet.hypoallergenic = updatedData.hypoallergenic;
    if (updatedData.dietaryRestrictions) updatedPet.dietaryRestrictions = updatedData.dietaryRestrictions;
    if (updatedData.picture) updatedPet.picture = updatedData.picture;
    await updatedPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to update pet' });
  }
});

//User Pet
petsRouter.get('/user/:userId', async (request, response) => {
  try {
    const userId = request.params.userId;
    const pets = await Pet.find({ adoptedByUser: { $in: [userId] } });
    const user = await User.findById(userId);
    response.json({ pets, user });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});




//New Pet
petsRouter.post('/create', upload.single('picture'), async (request, response) => {
  try {
    const petData = request.body;
    const file = request.file.path;
    const cloudinaryResponse = await cloudinary.uploader.upload(file, { upload_preset: 'pets_project' });
    const newPet = new Pet({
      name: petData.name,
      type: petData.type,
      color: petData.color,
      breed: petData.breed,
      bio: petData.bio,
      height: petData.height,
      weight: petData.weight,
      adoptionStatus: petData.status,
      hypoallergenic: petData.hypoallergenic,
      dietaryRestrictions: petData.dietaryRestrictions,
      picture: cloudinaryResponse.secure_url,
    });
    await newPet.save();
    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: 'Failed to upload file' });
  }
});



module.exports = petsRouter;