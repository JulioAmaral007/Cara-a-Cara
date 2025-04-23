// Dados simulados
const opponent = { name: 'JogadorInimigo' }
const isMyTurn = true

// DOM Elements
const opponentName = document.getElementById('opponent-name')
const turnIndicator = document.getElementById('turn-indicator')
const secretCharacterCard = document.getElementById('secret-character-card')

const charactersGrid = document.getElementById('characters-grid')

const messagesContainer = document.getElementById('messages-container')
const messageInput = document.getElementById('message-input')
const sendMessageBtn = document.getElementById('send-message-btn')
const clearChatBtn = document.getElementById('clear-chat-btn')

const leaveGameBtn = document.getElementById('leave-game-btn')

// Inicialização
function initGameScreen() {
  opponentName.textContent = opponent.name
  toggleTurnIndicator(isMyTurn)
  addCharacterClickEvents()
}

// Alterna indicador de turno
function toggleTurnIndicator(isYourTurn) {
  if (isYourTurn) {
    turnIndicator.classList.add('your-turn')
    turnIndicator.classList.remove('opponent-turn')
    turnIndicator.innerHTML = `<i class="fas fa-play"></i> <span>Seu turno</span>`
  } else {
    turnIndicator.classList.remove('your-turn')
    turnIndicator.classList.add('opponent-turn')
    turnIndicator.innerHTML = `<i class="fas fa-clock"></i> <span>Turno do oponente</span>`
  }
}

// Clique nos personagens para marcar/eliminar
function addCharacterClickEvents() {
  const cards = charactersGrid.querySelectorAll('.character-card')
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('eliminated')
    })
  })
}

// Enviar mensagem
sendMessageBtn.addEventListener('click', sendMessage)
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage()
})

function sendMessage() {
  const text = messageInput.value.trim()
  if (!text) return

  const msg = document.createElement('div')
  msg.className = 'chat-message'
  msg.innerHTML = `<p><strong>Você:</strong> ${text}</p>`
  messagesContainer.appendChild(msg)
  messageInput.value = ''
  messagesContainer.scrollTop = messagesContainer.scrollHeight

  // Simula resposta automática
  setTimeout(() => {
    const response = document.createElement('div')
    response.className = 'chat-message opponent-message'
    response.innerHTML = `<p><strong>${opponent.name}:</strong> ${getBotReply(text)}</p>`
    messagesContainer.appendChild(response)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }, 1000)
}

// Limpar chat
clearChatBtn.addEventListener('click', () => {
  messagesContainer.innerHTML = ''
})

// Bot simples de simulação
function getBotReply(msg) {
  if (msg.toLowerCase().includes('seu personagem é')) {
    return 'Hmm... talvez!'
  }
  if (msg.includes('?')) {
    return Math.random() > 0.5 ? 'Sim.' : 'Não.'
  }
  return 'Não entendi a pergunta.'
}

// Sair do jogo
leaveGameBtn.addEventListener('click', () => {
  alert('Você saiu do jogo.')
  // Aqui você pode redirecionar ou esconder a tela de jogo
})

// Executa ao carregar
initGameScreen()
