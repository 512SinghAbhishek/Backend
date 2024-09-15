
const express = require('express');
const nodemailer = require("nodemailer")
require('./models/mongo_config');
const User = require('./models/user_models');
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const app = express();
app.use(express.json());
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { log, count } = require('console');
// Configure body-parser to handle JSON data
app.use(bodyParser.json());
// Recieved Data From CrossHeader...........................
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
//........................................................................................................
//........................ALL API FOR USER................................................................
//........................................................................................................
// Registration API  For User Registration..................
//..........................................................
app.post('/register', async (req, res) => {
  const { Phone_Number, Password } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ Phone_Number });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    // Create a new user document
    const newUser = new User(req.body);
    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});
//...........................................................
//Login API Heare for User Login.............................
//...........................................................
app.post('/login', async (req, res) => {

  const { Phone_Number, Password } = req.body;
  try {

    const user = await User.findOne({ Phone_Number });


    if (!user) {
      return res.status(200).json({message:'Worng_Phone_no!!'});
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return res.status(200).json({message:'Worng_password!!'});
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ message: "success", name: `${user.Full_name}`, phone: `${Phone_Number}` });
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/management_history', async (req, res) => {
  const filters = req.body;

  // Define your filter query as an object
  let filter = {};

  // Check if Phone_Number is provided, otherwise retrieve all data
  if (filters.Phone_Number && filters.Phone_Number.trim() !== '') {
    filter = {
      Phone_Number: filters.Phone_Number,
      email:filters.email
    };
  }

  try {
    // Find documents in the 'User' collection that match the filter
    const result = await User.find(filter);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No matching records found' });
    }
  } catch (error) {
    console.error('Error retrieving management history:', error);
    res.status(500).json({ message: 'Error retrieving management history', error: error });
  }
});


app.delete('/user_management_status', async (req, res) => {
  const { Phone_Number } = req.query; // Retrieve Phone_Number from query params
  try {
    const result = await User.findOneAndDelete({ Phone_Number: String(Phone_Number) });

    if (result) {
      return res.status(200).json({ message: 'User deleted successfully', deleted: result });
    } else {
      return res.status(404).json({ message: 'User with the given phone number not found' });
    }
  } catch (error) {
    console.error('Error during user deletion:', error);
    res.status(500).json({ message: 'Error deleting user', error: error });
  }
});



app.put('/user_management_Edit', async (req, res) => {
  const { Phone_Number, new_Phone_Number, new_Email } = req.body;

  try {
    // Find the user by the existing phone number and update the phone number and email
    const result = await User.findOneAndUpdate(
      { Phone_Number: String(Phone_Number) },
      { $set: { Phone_Number: new_Phone_Number, Email: new_Email } }, // Set new phone number and email
      { new: true } // Return the updated document
    );

    if (result) {
      return res.status(200).json({ message: 'User information updated successfully', updated: result });
    } else {
      return res.status(404).json({ message: 'User with the given phone number not found' });
    }
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Error updating user information', error: error });
  }
});


app.listen(5000, () => {
  console.log('app is runnig is 5000 port')

});