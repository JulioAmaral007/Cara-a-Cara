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
const WebSocket = require('ws')
const http = require('http')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

const wss = new WebSocket.Server({ server }); //reaproveita servidor para servidor com socket

app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(
  cors({
    origin: 'https//localhost:3000',
    credentials: true,
  })
)

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
    components: {
      securitySchemes: {
        sessionId: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'ID da sessão do usuário',
        },
      },
    },
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

// Session configuration

app.use(
  session({
    secret: 'progwebt1',
    resave: false,
    saveUninitialized: false,
    store: mongostr.create({
      mongoUrl: 'mongodb://localhost:27017/cara-a-cara',
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
)

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' })
    res.sendFile(__dirname + '/public/pages/login.html')
  } else next()
}

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints de autenticação
 *   - name: Game
 *     description: Endpoints relacionados ao jogo
 *   - name: Player
 *     description: Endpoints relacionados aos jogadores
 */

// Auth routes

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
  console.log('Registering attempt:', req.body)
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
    console.log('New user registered: ', user.username)
  } catch (err) {
    res.status(400).json({
      error: 'Error registering',
      details: err.message,
    })
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login de um usuário
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
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are logged
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: jogador123
 *                     victories:
 *                       type: integer
 *                       example: 5
 *                     gamesPlayed:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Senha incorreta
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    req.session.userId = user._id
    await User.findByIdAndUpdate(user._id, {
      lastActive: new Date(),
      isOnline: true,
    })

    res.json({
      message: 'You are logged',
      user: {
        username: user.username,
        victories: user.victories,
        gamesPlayed: user.gamesPlayed,
      },
    })
    console.log(user.username, 'is logged')
  } catch (err) {
    res.status(500).json({
      error: 'Login failed',
      details: err.message,
    })
  }
})

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza logout do usuário
 *     tags: [Auth]
 *     security:
 *       - sessionId: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/auth/logout', requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.session.userId, {
    lastActive: new Date(),
    isOnline: false,
  })
  req.session.destroy(err => {
    if (err)
      return res.status(500).json({
        error: 'Internal server error, logout failed',
        details: err.message,
      })
    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out' })
    console.log('Logged out successfully')
  })
})

// Game routes

/**
 * @swagger
 * /game/update:
 *   post:
 *     summary: Atualiza estatísticas do jogo
 *     tags: [Game]
 *     security:
 *       - sessionId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winner
 *               - loser
 *             properties:
 *               winner:
 *                 type: string
 *                 example: jogador123
 *               loser:
 *                 type: string
 *                 example: jogador456
 *     responses:
 *       200:
 *         description: Estatísticas atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wVictories:
 *                   type: integer
 *                   example: 6
 *                 wGamesPlayed:
 *                   type: integer
 *                   example: 11
 *                 lGamesPlayed:
 *                   type: integer
 *                   example: 8
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Jogador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/game/update', requireAuth, async (req, res) => {
  try {
    let { winner, loser } = req.body

    let [winnerUpdate, loserUpdate] = await Promise.all([
      User.findOneAndUpdate(
        { username: winner },
        { $inc: { victories: 1, gamesPlayed: 1 } },
        { new: true }
      ),
      User.findOneAndUpdate({ username: loser }, { $inc: { gamesPlayed: 1 } }, { new: true }),
    ])

    if (!winnerUpdate || !loserUpdate) {
      if (winnerUpdate) {
        await User.findOneAndUpdate(
          { username: winner },
          { $inc: { victories: -1, gamesPlayed: -1 } }
        )
      }
      if (loserUpdate) {
        await User.findOneAndUpdate({ username: loser }, { $inc: { gamesPlayed: -1 } })
      }

      return res.status(404).json({
        success: false,
        error: 'Player not found',
        details: !winnerUpdate ? `User "${winner}" not found` : `User "${loser}" not found`,
      })
    }

    res.json({
      success: true,
      wVictories: winnerUpdate.victories,
      wGamesPlayed: winnerUpdate.gamesPlayed,
      lGamesPlayed: loserUpdate.gamesPlayed,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Couldn't update player stats",
      details: err.message,
    })
  }
})

// Player routes

/**
 * @swagger
 * /players/online:
 *   get:
 *     summary: Lista todos os jogadores online
 *     tags: [Player]
 *     security:
 *       - sessionId: []
 *     responses:
 *       200:
 *         description: Lista de jogadores online
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: jogador123
 *                   victories:
 *                     type: integer
 *                     example: 5
 *                   gamesPlayed:
 *                     type: integer
 *                     example: 10
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
app.get('/players/online', requireAuth, async (req, res) => {
  try {
    let users = await User.find(
      {
        isOnline: true,
      },
      {
        password: 0,
        createdAt: 0,
        updatedAt: 0,
        lastActive: 0,
        isOnline: 0,
        _id: 0,
      }
    )
    res.json(users)
  } catch (err) {
    res.status(500).json("Couldn't return online players")
  }
})

/**
 * @swagger
 * /player/stats:
 *   get:
 *     summary: Obtém estatísticas do jogador atual
 *     tags: [Player]
 *     security:
 *       - sessionId: []
 *     responses:
 *       200:
 *         description: Estatísticas do jogador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: jogador123
 *                     victories:
 *                       type: integer
 *                       example: 5
 *                     gamesPlayed:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Jogador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.get('/player/stats', requireAuth, async (req, res) => {
  try {
    let userId = req.session.userId
    //console.log('Session userId:', userId, 'Type:', typeof userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
        receiveId: userId,
      })
    }

    let player = await User.findById(userId, {
      username: 1,
      victories: 1,
      gamesPlayed: 1,
      _id: 0,
    })

    if (!player) {
      return res.status(404).json({
        error: 'Player was not found',
        debug: {
          sessionUserId: userId,
        },
      })
    }

    res.json({ player })
  } catch (err) {
    res.status(500).json({
      error: 'Server error',
      details: err.message,
    })
  }
})

/**
 * @swagger
 * /player/{username}:
 *   get:
 *     summary: Obtém informações de um jogador específico
 *     tags: [Player]
 *     security:
 *       - sessionId: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do usuário
 *     responses:
 *       200:
 *         description: Informações do jogador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: jogador123
 *                 victories:
 *                   type: integer
 *                   example: 5
 *                 gamesPlayed:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Jogador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.get('/player/:username', requireAuth, async (req, res) => {
  try {
    let user = await User.findOne(
      {
        username: req.params.username,
      },
      {
        password: 0,
        createdAt: 0,
        updatedAt: 0,
        lastActive: 0,
        _id: 0,
      }
    )
    if (!user) {
      return res.status(404).json({ error: 'Player was not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
})

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => console.log('Server running on port ', PORT))

//WebSocket
const clientesConectados = new Map();

// Evento de conexão WebSocket
wss.on('connection', (ws) => {
    console.log('Cliente conectado via WebSocket');
  
    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
  
      if (data.type === 'login') {
        const nome = data.nome;

        for (const [sock, user] of clientesConectados.entries()) {
          if (user === nome) {
            sock.close();
            clientesConectados.delete(sock);
          }
        }  

        clientesConectados.set(ws, nome);
        //console.log(`Usuário logou: ${nome}`);
      }
      if(data.type == "log-out"){
        const nome = data.nome;

        for (const [sock, user] of clientesConectados.entries()) {
          if (user === nome) {
            sock.close();
            clientesConectados.delete(sock);
          }
        } 

        console.log(`Usuário deslogou: ${nome}`);
      }
      
      if (data.type === 'desafio') {
        const wsAlvo = getWsByNome(data.para);
        //console.log(data.de)
        //console.log(data.para)
        if (wsAlvo) {
          wsAlvo.send(JSON.stringify({
            type: 'convite',
            de: data.de
          }));
        }
      }

      if (data.type === 'respostaDesafio') {
        const wsDesafiante = getWsByNome(data.para);
        if (wsDesafiante) {
          wsDesafiante.send(JSON.stringify({
            type: 'respostaDesafio',
            aceita: data.aceita,
            com: data.de
          }));
        }
      }

      if (data.type === 'msg-env-game') {
        
        console.log(`Mensagem privada de ${data.de} para ${data.para}: ${data.valor}`);

        const destinatario = getWsByNome(data.para);
        //console.log(`Destinatário resolvido: ${destinatario ? 'sim' : 'não'}`);
        //console.log(`Destino WebSocket encontrado: ${clientesConectados.get(destinatario)}`);
        if (destinatario.readyState === WebSocket.OPEN) {
          destinatario.send(JSON.stringify({
            type: 'msg-receb-game',
            de: data.de,
            valor: data.valor
          }));
        } else {
          console.log("WebSocket do destinatário está fechado.");
        }
      }
      if (data.type === 'msg-end-game') {
        
        const destinatario = getWsByNome(data.para);
        //console.log(`Destinatário resolvido: ${destinatario ? 'sim' : 'não'}`);
        //console.log(`Destino WebSocket encontrado: ${clientesConectados.get(destinatario)}`);
        if (destinatario.readyState === WebSocket.OPEN) {
          destinatario.send(JSON.stringify({
            type: 'msg-end-game',
            de: data.de,
          }));
        } else {
          console.log("WebSocket do destinatário está fechado.");
        }
      }
      
      broadcastListaUsuarios();

    });

    ws.on('close', () => {
      clientesConectados.delete(ws); // remove da lista
      broadcastListaUsuarios(); // envia lista atualizada para os demais
    });

  });

  function broadcastListaUsuarios() {
    const nomes = Array.from(clientesConectados.values());
  
    const mensagem = {
      type: 'lista-usuarios',
      usuarios: nomes
    };
  
    const json = JSON.stringify(mensagem);
  
    clientesConectados.forEach((_, clienteSocket) => {
      if (clienteSocket.readyState === WebSocket.OPEN) {
        clienteSocket.send(json);
      }
    });
  }

  function getWsByNome(nome) {
    for (const [ws, nomeCliente] of clientesConectados.entries()) {
      if (nomeCliente === nome) return ws;
    }
    return null;
  }