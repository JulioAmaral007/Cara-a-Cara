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
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public/pages')))

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
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./server.js'], // Documentação dentro deste arquivo
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
  seveUnitialized: false,
  store: mongostr.create({
    mongoUrl: 'mongodb://localhost:27017/cara-a-cara',
  }),
  cookie: { secure: false}
}));

const requireAuth = (req, res, next) => {
    if(!req.session.useId) {
      res.status(401).json({error: 'Not authenticated'});
      res.sendFile(_dirname + '/pages/login.html');
    } else next();
}

// Rotes

// Auth routes


// route for registering
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

    req.session.sessionId = user._id;

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
app.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) return res.status(500).json({
      error: 'Internal server error, logout failed',
      details: err.message
    })
    res.json({message: 'Logged out'})
  })
})

// Game routes

app.post('/game/start', (req, res) => {
 try {

 } catch {

 }
});

app.post('/game/:id', (req, res) => {
  try {

  } catch {
    
  }
});

// Player routes

app.get('/players/online', (req, res) => {
  try {

  } catch {

  }
});

app.post('/player/:id', (req, res) => {
  try {

  } catch {

  }
});

app.post('/player/stats', (req, res) => {
  try {

  } catch {

  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ', PORT));