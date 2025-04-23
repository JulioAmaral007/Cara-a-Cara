// Dados do jogo
const characters = [
  { id: 1, name: "Ana", gender: "female", hairColor: "blonde", hasGlasses: true, hasHat: false, hasBeard: false },
  { id: 2, name: "João", gender: "male", hairColor: "black", hasGlasses: false, hasHat: false, hasBeard: true },
  { id: 3, name: "Maria", gender: "female", hairColor: "brown", hasGlasses: true, hasHat: true, hasBeard: false },
  { id: 4, name: "Pedro", gender: "male", hairColor: "red", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 5, name: "Carla", gender: "female", hairColor: "black", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 6, name: "Lucas", gender: "male", hairColor: "blonde", hasGlasses: true, hasHat: false, hasBeard: true },
  { id: 7, name: "Sofia", gender: "female", hairColor: "red", hasGlasses: false, hasHat: true, hasBeard: false },
  { id: 8, name: "Miguel", gender: "male", hairColor: "brown", hasGlasses: true, hasHat: true, hasBeard: false },
  { id: 9, name: "Júlia", gender: "female", hairColor: "blonde", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 10, name: "Rafael", gender: "male", hairColor: "black", hasGlasses: false, hasHat: true, hasBeard: true },
  { id: 11, name: "Beatriz", gender: "female", hairColor: "brown", hasGlasses: true, hasHat: false, hasBeard: false },
  { id: 12, name: "Gabriel", gender: "male", hairColor: "blonde", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 13, name: "Isabela", gender: "female", hairColor: "black", hasGlasses: true, hasHat: true, hasBeard: false },
  { id: 14, name: "Mateus", gender: "male", hairColor: "red", hasGlasses: true, hasHat: false, hasBeard: true },
  { id: 15, name: "Laura", gender: "female", hairColor: "brown", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 16, name: "Davi", gender: "male", hairColor: "black", hasGlasses: true, hasHat: true, hasBeard: false },
  { id: 17, name: "Manuela", gender: "female", hairColor: "red", hasGlasses: true, hasHat: false, hasBeard: false },
  { id: 18, name: "Bernardo", gender: "male", hairColor: "brown", hasGlasses: false, hasHat: false, hasBeard: true },
  {
    id: 19,
    name: "Valentina",
    gender: "female",
    hairColor: "blonde",
    hasGlasses: false,
    hasHat: true,
    hasBeard: false,
  },
  { id: 20, name: "Enzo", gender: "male", hairColor: "black", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 21, name: "Helena", gender: "female", hairColor: "brown", hasGlasses: true, hasHat: true, hasBeard: false },
  { id: 22, name: "Arthur", gender: "male", hairColor: "blonde", hasGlasses: true, hasHat: false, hasBeard: true },
  { id: 23, name: "Alice", gender: "female", hairColor: "red", hasGlasses: false, hasHat: false, hasBeard: false },
  { id: 24, name: "Heitor", gender: "male", hairColor: "brown", hasGlasses: false, hasHat: true, hasBeard: false },
]

// Estado do jogo
let currentUser = null
let currentScreen = "login"
let secretCharacter = null
let eliminatedCharacters = []
let isMyTurn = true
let currentOpponent = null
let messages = []

// Elementos do DOM
const screens = {
  login: document.getElementById("login-screen"),
  lobby: document.getElementById("lobby-screen"),
  game: document.getElementById("game-screen"),
}

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", () => {
  // Mostrar a tela de login por padrão
  showScreen("login")

  // Configurar event listeners
  setupLoginRegisterTabs()
  setupFormSubmissions()
  setupGameEvents()

  // Verificar se o usuário já está logado
  checkAuthStatus()
})

// Navegação entre telas
function showScreen(screenName) {
  // Esconder todas as telas
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active")
  })

  // Mostrar a tela solicitada
  screens[screenName].classList.add("active")
  currentScreen = screenName

  // Configuração adicional com base na tela
  if (screenName === "game") {
    setupGameBoard()
  } else if (screenName === "lobby") {
    fetchOnlinePlayers()
    updateUserStats()
  }
}

// Abas de Login/Registro
function setupLoginRegisterTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab")

      // Atualizar botão da aba ativa
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Mostrar o conteúdo da aba selecionada
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabName}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })
}

// Envio de formulários
function setupFormSubmissions() {
  // Formulário de login
  const loginForm = document.getElementById("login-form")
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value

    loginUser(username, password)
  })

  // Formulário de registro
  const registerForm = document.getElementById("register-form")
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("register-username").value
    const password = document.getElementById("register-password").value
    const confirmPassword = document.getElementById("register-confirm-password").value

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    registerUser(username, password)
  })

  // Botão de logout
  const logoutBtn = document.getElementById("logout-btn")
  logoutBtn.addEventListener("click", () => {
    logoutUser()
  })

  // Botão de sair do jogo
  const leaveGameBtn = document.getElementById("leave-game-btn")
  leaveGameBtn.addEventListener("click", () => {
    leaveGame()
  })

  // Botão de atualizar jogadores
  const refreshPlayersBtn = document.getElementById("refresh-players-btn")
  refreshPlayersBtn.addEventListener("click", () => {
    fetchOnlinePlayers()
  })

  // Botão de limpar chat
  const clearChatBtn = document.getElementById("clear-chat-btn")
  clearChatBtn.addEventListener("click", () => {
    clearChat()
  })
}

// Eventos do jogo
function setupGameEvents() {
  // Botão de enviar mensagem
  const sendMessageBtn = document.getElementById("send-message-btn")
  const messageInput = document.getElementById("message-input")

  sendMessageBtn.addEventListener("click", () => {
    sendMessage()
  })

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })
}

// Chamadas de API
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/user")

    if (response.ok) {
      const userData = await response.json()
      currentUser = userData

      // Atualizar UI
      updateUserInfo()

      // Navegar para o lobby
      showScreen("lobby")
    } else {
      // Usuário não está logado, permanecer na tela de login
      showScreen("login")
    }
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error)
    showScreen("login")
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const userData = await response.json()
      currentUser = userData

      // Atualizar UI
      updateUserInfo()

      // Navegar para o lobby
      showScreen("lobby")
    } else {
      const error = await response.json()
      alert(error.message || "Falha no login. Verifique suas credenciais.")
    }
  } catch (error) {
    console.error("Erro de login:", error)
    alert("Erro ao conectar com o servidor. Tente novamente mais tarde.")
  }
}

async function registerUser(username, password) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const userData = await response.json()
      currentUser = userData

      // Atualizar UI
      updateUserInfo()

      // Navegar para o lobby
      showScreen("lobby")
    } else {
      const error = await response.json()
      alert(error.message || "Falha no registro. Tente outro nome de usuário.")
    }
  } catch (error) {
    console.error("Erro de registro:", error)
    alert("Erro ao conectar com o servidor. Tente novamente mais tarde.")
  }
}

async function logoutUser() {
  try {
    await fetch("/api/logout", { method: "POST" })
    currentUser = null
    showScreen("login")
  } catch (error) {
    console.error("Erro de logout:", error)
  }
}

async function fetchOnlinePlayers() {
  try {
    const response = await fetch("/api/players/online")

    if (response.ok) {
      const players = await response.json()
      populatePlayersList(players)
    } else {
      console.error("Falha ao buscar jogadores online")
    }
  } catch (error) {
    console.error("Erro ao buscar jogadores online:", error)
  }
}

async function updateVictory() {
  try {
    const response = await fetch("/api/user/victory", {
      method: "PUT",
    })

    if (response.ok) {
      const userData = await response.json()
      currentUser = userData
      updateUserInfo()
    }
  } catch (error) {
    console.error("Erro ao atualizar vitória:", error)
  }
}

async function updateLoss() {
  try {
    const response = await fetch("/api/user/loss", {
      method: "PUT",
    })

    if (response.ok) {
      const userData = await response.json()
      currentUser = userData
      updateUserInfo()
    }
  } catch (error) {
    console.error("Erro ao atualizar derrota:", error)
  }
}

// Funções de atualização da UI
function updateUserInfo() {
  if (!currentUser) return

  document.getElementById("user-display-name").textContent = currentUser.username
  document.getElementById("user-victories").textContent = `${currentUser.victories} vitórias`
  document.getElementById("user-games").textContent = `${currentUser.gamesPlayed} jogos`
}

function updateUserStats() {
  if (!currentUser) return

  document.getElementById("stat-victories").textContent = currentUser.victories
  document.getElementById("stat-games").textContent = currentUser.gamesPlayed

  const winRate = currentUser.gamesPlayed > 0 ? Math.round((currentUser.victories / currentUser.gamesPlayed) * 100) : 0

  document.getElementById("stat-winrate").textContent = `${winRate}%`
}

// Funções do Lobby
function populatePlayersList(players) {
  const playersList = document.getElementById("players-list")
  const noPlayersMessage = document.getElementById("no-players-message")

  playersList.innerHTML = ""

  if (players.length === 0) {
    noPlayersMessage.classList.remove("hidden")
    return
  }

  noPlayersMessage.classList.add("hidden")

  players.forEach((player) => {
    const li = document.createElement("li")
    li.innerHTML = `
      <div class="player-info">
        <div class="player-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div>
          <span class="player-name">${player.username}</span>
          <div class="player-victories">${player.victories} vitórias em ${player.gamesPlayed} jogos</div>
        </div>
      </div>
      <div class="play-button">
        <i class="fas fa-play"></i> Jogar
      </div>
    `

    li.addEventListener("click", () => {
      startGame(player)
    })

    playersList.appendChild(li)
  })
}

// Funções do Jogo
function startGame(opponent) {
  currentOpponent = opponent

  // Atualizar UI
  document.getElementById("opponent-name").textContent = opponent.username
  updateTurnIndicator()

  // Navegar para a tela do jogo
  showScreen("game")
}

function leaveGame() {
  // Resetar estado do jogo
  secretCharacter = null
  eliminatedCharacters = []
  isMyTurn = true
  currentOpponent = null
  messages = []

  // Limpar mensagens
  clearChat()

  // Navegar de volta para o lobby
  showScreen("lobby")
}

function setupGameBoard() {
  // Selecionar um personagem secreto aleatório
  secretCharacter = characters[Math.floor(Math.random() * characters.length)]

  // Exibir personagem secreto
  const secretCharacterCard = document.getElementById("secret-character-card")
  secretCharacterCard.innerHTML = `
    <img src="/placeholder.svg?height=200&width=150" alt="${secretCharacter.name}">
    <div class="character-name">${secretCharacter.name}</div>
  `

  // Preencher a grade de personagens
  const charactersGrid = document.getElementById("characters-grid")
  charactersGrid.innerHTML = ""

  characters.forEach((character) => {
    const card = document.createElement("div")
    card.className = "character-card"
    card.dataset.id = character.id

    card.innerHTML = `
      <img src="/placeholder.svg?height=150&width=120" alt="${character.name}">
      <div class="character-name">${character.name}</div>
    `

    card.addEventListener("click", () => {
      toggleCharacterElimination(character.id)
    })

    charactersGrid.appendChild(card)
  })

  // Resetar personagens eliminados
  eliminatedCharacters = []
}

function toggleCharacterElimination(characterId) {
  const card = document.querySelector(`.character-card[data-id="${characterId}"]`)

  if (eliminatedCharacters.includes(characterId)) {
    // Deseliminar personagem
    eliminatedCharacters = eliminatedCharacters.filter((id) => id !== characterId)
    card.classList.remove("eliminated")
  } else {
    // Eliminar personagem
    eliminatedCharacters.push(characterId)
    card.classList.add("eliminated")
  }
}

function updateTurnIndicator() {
  const turnIndicator = document.getElementById("turn-indicator")

  if (isMyTurn) {
    turnIndicator.className = "turn-indicator your-turn"
    turnIndicator.innerHTML = `<i class="fas fa-play"></i> <span>Seu turno</span>`
  } else {
    turnIndicator.className = "turn-indicator opponent-turn"
    turnIndicator.innerHTML = `<i class="fas fa-pause"></i> <span>Turno do oponente</span>`
  }
}

function sendMessage() {
  const messageInput = document.getElementById("message-input")
  const messageText = messageInput.value.trim()

  if (!messageText) return

  // Adicionar mensagem ao chat
  addMessage({
    sender: currentUser.username,
    text: messageText,
    isMine: true,
  })

  // Limpar input
  messageInput.value = ""

  // Em um app real, você enviaria esta mensagem para o servidor via WebSockets
  // Para fins de demonstração, vamos simular uma resposta após um curto atraso
  isMyTurn = false
  updateTurnIndicator()

  setTimeout(() => {
    // Simular resposta do oponente
    const responses = ["Sim", "Não", "Talvez...", "Não tenho certeza", "Definitivamente sim", "Definitivamente não"]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    addMessage({
      sender: currentOpponent.username,
      text: randomResponse,
      isMine: false,
    })

    isMyTurn = true
    updateTurnIndicator()
  }, 1500)
}

function addMessage(message) {
  messages.push(message)

  const messagesContainer = document.getElementById("messages-container")
  const messageElement = document.createElement("div")
  messageElement.className = `message ${message.isMine ? "sent" : "received"}`

  messageElement.innerHTML = `
    <div class="message-sender">${message.sender}</div>
    <div class="message-text">${message.text}</div>
  `

  messagesContainer.appendChild(messageElement)
  messagesContainer.scrollTop = messagesContainer.scrollHeight

  // Verificar se a mensagem é um palpite
  if (message.isMine && message.text.toLowerCase().includes("seu personagem é")) {
    const guessedName = message.text.toLowerCase().replace("seu personagem é", "").trim()
    const isCorrectGuess = Math.random() < 0.5 // 50% de chance de estar correto para demonstração

    setTimeout(() => {
      if (isCorrectGuess) {
        alert("Parabéns! Você acertou e venceu o jogo!")
        updateVictory()
      } else {
        alert("Que pena! Você errou e perdeu o jogo.")
        updateLoss()
      }

      leaveGame()
    }, 1000)
  }
}

function clearChat() {
  const messagesContainer = document.getElementById("messages-container")
  messagesContainer.innerHTML = `
    <div class="system-message">
      <p>Jogo iniciado! Faça perguntas que possam ser respondidas com SIM ou NÃO.</p>
      <p>Para adivinhar, digite "Seu personagem é [nome]".</p>
    </div>
  `
  messages = []
}
