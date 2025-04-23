// Estado do jogo
let currentUser = null
let currentOpponent = null
let secretCharacter = null
let eliminatedCharacters = []
let isMyTurn = true
let messages = []

// Import necessary functions (assuming they are in separate files)
import { checkAuthStatus } from "./auth.js"; // Adjust path as needed
import { characters } from "./characters.js"; // Adjust path as needed
import { clearGameDataFromStorage, getGameDataFromStorage } from "./storage.js"; // Adjust path as needed

// Inicializar a tela de jogo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar se o usuário está logado
  const user = await checkAuthStatus()

  if (!user) {
    // Usuário não está logado, redirecionar para a página de login
    // window.location.href = "login.html"
    return
  }

  // Obter dados do jogo do localStorage
  const gameData = getGameDataFromStorage()

  if (!gameData || !gameData.opponent) {
    // Dados do jogo não encontrados, redirecionar para o lobby
    // window.location.href = "lobby.html"
    return
  }

  // Configurar o estado do jogo
  currentUser = user
  currentOpponent = gameData.opponent

  // Configurar a interface do jogo
  setupGameBoard()
  updateOpponentInfo()
  updateTurnIndicator()

  // Configurar event listeners
  setupEventListeners()
})

function setupEventListeners() {
  // Botão de sair do jogo
  const leaveGameBtn = document.getElementById("leave-game-btn")
  leaveGameBtn.addEventListener("click", leaveGame)

  // Botão de enviar mensagem
  const sendMessageBtn = document.getElementById("send-message-btn")
  sendMessageBtn.addEventListener("click", sendMessage)

  // Input de mensagem (enviar com Enter)
  const messageInput = document.getElementById("message-input")
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })

  // Botão de limpar chat
  const clearChatBtn = document.getElementById("clear-chat-btn")
  clearChatBtn.addEventListener("click", clearChat)
}

function updateOpponentInfo() {
  if (!currentOpponent) return

  document.getElementById("opponent-name").textContent = currentOpponent.username
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

function leaveGame() {
  // Limpar dados do jogo do localStorage
  clearGameDataFromStorage()

  // Redirecionar para o lobby
  // window.location.href = "lobby.html"
}

async function updateVictory() {
  try {
    const response = await fetch("/api/user/victory", {
      method: "PUT",
    })

    if (response.ok) {
      currentUser = await response.json()
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
      currentUser = await response.json()
    }
  } catch (error) {
    console.error("Erro ao atualizar derrota:", error)
  }
}
