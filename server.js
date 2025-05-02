const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const mongostr = require('connect-mongo')
const path = require('path')
const User = require('./models/User')
const Game = require('./models/Game')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(cors({
  origin: 'https//localhost:3000',
  credentials: true
}));

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Autenticação - Cara-a-Cara',
      version: '1.0.0',
      description: 'API para autenticação de usuários no jogo Cara-a-Cara',
    },
    servers: [
      {
        url: 'https://localhost:3000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./server.js'],
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/cara-a-cara', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error("Error. Couldn't connect to MongoDB", err))

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints de autenticação
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: jogador123
 *               password:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: jogador123
 *                     victories:
 *                       type: integer
 *                       example: 0
 *                     gamesPlayed:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Erro ao registrar o usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error registering
 *                 details:
 *                   type: string
 *                   example: "E11000 duplicate key error collection"
 */

// Session configuration

app.use(session({
  secret: 'progwebt1',
  resave: false,
  saveUninitialized: false,
  store: mongostr.create({
    mongoUrl: 'mongodb://localhost:27017/cara-a-cara',
  }),
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

const requireAuth = (req, res, next) => {
    if(!req.session.userId) {
      res.status(401).json({error: 'Not authenticated'});
      res.sendFile(__dirname + '/public/pages/login.html');
    } else next();
}

// Rotes

// Auth routes

// route for registering
app.post('/auth/register', async (req, res) => {
  console.log('Registering attempt:', req.body);
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
    console.log('New user registered: ', user.username);
  } catch (err) {
    res.status(400).json({
      error: 'Error registering',
      details: err.message
    });
  }
});

//route for logging in
app.post('/auth/login', async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({username});

    if(!user) {
      return res.status(404).json({error: 'User not found'});
    }

    if(!(await bcrypt.compare(password, user.password))){
      return res.status(401).json({error: 'Incorrect password'});
    }

    req.session.userId = user._id;
    await User.findByIdAndUpdate(user._id, {
      lastActive: new Date(),
      isOnline: true
    });

    res.json({
      message: 'You are logged',
      user: {
        username: user.username,
        victories: user.victories
      }
    })
    console.log(user.username,'is logged');

  } catch(err) {
    res.status(500).json({
      error: 'Login failed',
      details: err.message
    });
  }
})

// route for logging out
app.post('/auth/logout', requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.session.userId, {
    lastActive: new Date(),
    isOnline: false
  })
  req.session.destroy(err => {
    if(err) return res.status(500).json({
      error: 'Internal server error, logout failed',
      details: err.message
    })
    res.clearCookie('connect.sid');
    res.json({message: 'Logged out'})
    console.log('Logged out successfully')
  })
})

// Game routes

app.post('/game/start', requireAuth, (req, res) => {
 try {

 } catch {

 }
});

app.get('/game/:id', requireAuth, (req, res) => {
  try {

  } catch {
    
  }
});

// Player routes

app.get('/players/online', requireAuth, async (req, res) => {
  try {
    let users = await User.find({isOnline: true}, {password: 0});
    res.json(users);
  } catch (err) {
    res.status(500).json("Couldn't return online players");
  }
});

app.get('/player/:username', requireAuth, async (req, res) => {
  try {
    let user = await User.findOne(
      {username: req.params.username},
      {password: 0}
    );
    if(!user){
      return res.status(404).json({error: "Player was no found"});
    }
    res.json(user);
  } catch (err){
    res.status(500).json({error: 'Server error', details: err.message});
  }
});

app.get('/player/stats', requireAuth, async (req, res) => {
  try {
    let userId = req.session.userId;

    let player = await User.findById(
      userId,
      {
        victories: 1,
        gamesPlayed: 1,
        _id: 0
      }
    );

    if(!player) {
      return res.status(404).json({error: 'Player was not found'});
    }

    res.json({
      victories: player.victories,
      gamesPlayed: player.gamesPlayed
    });

  } catch (err){
    res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ', PORT));