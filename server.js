const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const path = require('path')
const User = require('./models/User')
const Game = require('./models/Game')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public/pages')))

// MongoDB connection

mongoose
  .connect('mongodb://localhost:27017/cara-a-cara', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error("Error. Couldn't connect to MongoDB", err))

// Session configuration

// Rotes

// Auth routes

app.post('/auth/register', async (req, res) => {
  try {
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User ({username, password: hashedPassword});
    await user.save();
    res.status(201).json({
      message: 'User created', 
      user: {
        username: user.username, 
        victories: user.victories, 
        gamesPlayed: user.gamesPlayed
      }
    });
  } catch (err) {
    res.status(400).json({
      error: 'Error registering',
      details: err.message
    });
  }
})

app.post('/auth/login', (req, res) => {

})

// Game routes

app.post('/game', (req, res) => {

})

app.post('/game:id', (req, res) => {

})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ', PORT))