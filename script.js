// Game data
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

// Mock data for online players
const mockPlayers = [
  { id: 1, username: "player1", victories: 5 },
  { id: 2, username: "player2", victories: 3 },
  { id: 3, username: "player3", victories: 8 },
  { id: 4, username: "player4", victories: 0 },
  { id: 5, username: "player5", victories: 12 },
]

// Game state
let currentUser = null
let currentScreen = "login"
let secretCharacter = null
let eliminatedCharacters = []
let isMyTurn = true
let currentOpponent = null
let messages = []

// DOM Elements
const screens = {
  login: document.getElementById("login-screen"),
  lobby: document.getElementById("lobby-screen"),
  game: document.getElementById("game-screen"),
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Show the login screen by default
  showScreen("login")

  // Set up event listeners
  setupLoginRegisterTabs()
  setupFormSubmissions()
  setupGameEvents()

  // For demo purposes, we'll add some mock data
  populatePlayersList(mockPlayers)
})

// Screen navigation
function showScreen(screenName) {
  // Hide all screens
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active")
  })

  // Show the requested screen
  screens[screenName].classList.add("active")
  currentScreen = screenName

  // Additional setup based on the screen
  if (screenName === "game") {
    setupGameBoard()
  }
}

// Login/Register tabs
function setupLoginRegisterTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab")

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Show the selected tab content
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabName}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })
}

// Form submissions
function setupFormSubmissions() {
  // Login form
  const loginForm = document.getElementById("login-form")
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value

    // In a real app, you would validate credentials with the server
    // For demo purposes, we'll just accept any input
    loginUser(username)
  })

  // Register form
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

    // In a real app, you would send registration data to the server
    // For demo purposes, we'll just accept any input
    registerUser(username, password)
  })

  // Logout button
  const logoutBtn = document.getElementById("logout-btn")
  logoutBtn.addEventListener("click", () => {
    logoutUser()
  })

  // Leave game button
  const leaveGameBtn = document.getElementById("leave-game-btn")
  leaveGameBtn.addEventListener("click", () => {
    leaveGame()
  })
}

// Game events
function setupGameEvents() {
  // Send message button
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

// User authentication
function loginUser(username) {
  currentUser = {
    username: username,
    victories: Math.floor(Math.random() * 10), // Random victories for demo
  }

  // Update UI
  document.getElementById("user-display-name").textContent = currentUser.username
  document.getElementById("user-victories").textContent = `(${currentUser.victories} vitórias)`

  // Navigate to lobby
  showScreen("lobby")
}

function registerUser(username, password) {
  // In a real app, you would send this data to the server
  // For demo purposes, we'll just log in the user
  loginUser(username)
}

function logoutUser() {
  currentUser = null
  showScreen("login")
}

// Lobby functions
function populatePlayersList(players) {
  const playersList = document.getElementById("players-list")
  playersList.innerHTML = ""

  players.forEach((player) => {
    // Don't show the current user in the list
    if (currentUser && player.username === currentUser.username) {
      return
    }

    const li = document.createElement("li")
    li.innerHTML = `
            <span class="player-name">${player.username}</span>
            <span class="player-victories">${player.victories} vitórias</span>
        `

    li.addEventListener("click", () => {
      startGame(player)
    })

    playersList.appendChild(li)
  })
}

// Game functions
function startGame(opponent) {
  currentOpponent = opponent

  // Update UI
  document.getElementById("opponent-name").textContent = opponent.username
  updateTurnIndicator()

  // Navigate to game screen
  showScreen("game")
}

function leaveGame() {
  // Reset game state
  secretCharacter = null
  eliminatedCharacters = []
  isMyTurn = true
  currentOpponent = null
  messages = []

  // Clear messages
  document.getElementById("messages-container").innerHTML = ""

  // Navigate back to lobby
  showScreen("lobby")
}

function setupGameBoard() {
  // Select a random secret character
  secretCharacter = characters[Math.floor(Math.random() * characters.length)]

  // Display secret character
  const secretCharacterCard = document.getElementById("secret-character-card")
  secretCharacterCard.innerHTML = `
        <img src="/placeholder.svg?height=150&width=120" alt="${secretCharacter.name}">
        <div class="character-name">${secretCharacter.name}</div>
    `

  // Populate the characters grid
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

  // Reset eliminated characters
  eliminatedCharacters = []
}

function toggleCharacterElimination(characterId) {
  const card = document.querySelector(`.character-card[data-id="${characterId}"]`)

  if (eliminatedCharacters.includes(characterId)) {
    // Un-eliminate character
    eliminatedCharacters = eliminatedCharacters.filter((id) => id !== characterId)
    card.classList.remove("eliminated")
  } else {
    // Eliminate character
    eliminatedCharacters.push(characterId)
    card.classList.add("eliminated")
  }
}

function updateTurnIndicator() {
  const turnIndicator = document.getElementById("turn-indicator")
  turnIndicator.textContent = isMyTurn ? "Seu turno" : "Turno do oponente"
}

function sendMessage() {
  const messageInput = document.getElementById("message-input")
  const messageText = messageInput.value.trim()

  if (!messageText) return

  // Add message to the chat
  addMessage({
    sender: currentUser.username,
    text: messageText,
    isMine: true,
  })

  // Clear input
  messageInput.value = ""

  // In a real app, you would send this message to the server via WebSockets
  // For demo purposes, we'll simulate a response after a short delay
  isMyTurn = false
  updateTurnIndicator()

  setTimeout(() => {
    // Simulate opponent's response
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

  // Check if the message is a guess
  if (message.isMine && message.text.toLowerCase().includes("seu personagem é")) {
    const guessedName = message.text.toLowerCase().replace("seu personagem é", "").trim()
    const isCorrectGuess = Math.random() < 0.5 // 50% chance of being correct for demo

    setTimeout(() => {
      if (isCorrectGuess) {
        alert("Parabéns! Você acertou e venceu o jogo!")
        currentUser.victories++
        document.getElementById("user-victories").textContent = `(${currentUser.victories} vitórias)`
      } else {
        alert("Que pena! Você errou e perdeu o jogo.")
      }

      leaveGame()
    }, 1000)
  }
}
