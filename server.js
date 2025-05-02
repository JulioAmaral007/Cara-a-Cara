const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const session = require('express-session')
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

// Session configuration

// Rotes

// Auth routes

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
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hashedPassword })
    await user.save()
    res.status(201).json({
      message: 'User created',
      user: {
        username: user.username,
        victories: user.victories,
        gamesPlayed: user.gamesPlayed,
      },
    })
  } catch (err) {
    res.status(400).json({
      error: 'Error registering',
      details: err.message,
    })
  }
})

app.post('/auth/login', (req, res) => {})

// Game routes

app.post('/game', (req, res) => {})

app.post('/game:id', (req, res) => {})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ', PORT))
