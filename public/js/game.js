//Websocket Setup
const ws = new WebSocket("ws://localhost:3000");

const meuID = sessionStorage.getItem("usuario");
const opponent = sessionStorage.getItem("oponente");


ws.onopen = () => {
  if (meuID) {
    ws.send(JSON.stringify({ type: 'login', nome: meuID }));
  }
};


ws.onmessage = (event) => {
  //console.log("Mensagem recebida bruta:", event.data); // 👈 deve aparecer
  const data = JSON.parse(event.data);

  if (data.type === 'msg-receb-game') {
    console.log(`Mensagem recebida: ${data.valor}`);
    writeMessage(data.valor);
  }
  if(data.type === 'msg-end-game'){
    alert(`${data.de} saiu do jogo. Jogo encerrado, voltando pra lobby...`);
    window.location.href = "lobby.html";
  }
};
//Fim websocket setup

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
  opponentName.textContent = opponent
  toggleTurnIndicator(isMyTurn)
  addCharacterClickEvents()
  setRandomSecretCharacter()
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
  // biome-ignore lint/complexity/noForEach: <explanation>
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped') // Adiciona ou remove a classe 'flipped'
    })
  })
}

// Define personagem secreto aleatório
function setRandomSecretCharacter() {
  const secretCharacterCard = document.getElementById('secret-character-card')

  // Lista de imagens dos personagens (ajuste o caminho conforme necessário)
  const characterImages = Array.from({ length: 24 }, (_, i) => `/imgs/f${i + 1}.png`)

  // Seleciona uma imagem aleatória
  const randomIndex = Math.floor(Math.random() * characterImages.length)
  const randomImage = characterImages[randomIndex]

  // Define a imagem no personagem secreto
  const imgElement = secretCharacterCard.querySelector('img')
  imgElement.src = randomImage
  imgElement.alt = `Personagem Secreto ${randomIndex + 1}`
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

  ws.send(JSON.stringify({
    type: 'msg-env-game',
    de: meuID,
    para: opponent,
    valor: text
  }));

  // Simula resposta automática
  /*setTimeout(() => {
    const response = document.createElement('div')
    response.className = 'chat-message opponent-message'
    response.innerHTML = `<p><strong>${opponent.name}:</strong> ${getBotReply(text)}</p>`
    messagesContainer.appendChild(response)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }, 1000)*/
}

function writeMessage(text){

  const msg = document.createElement('div')
  msg.className = 'chat-message'
  msg.innerHTML = `<p><strong>${opponent}:</strong> ${text}</p>`
  messagesContainer.appendChild(msg)
  messageInput.value = ''
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}


// Limpar chat
clearChatBtn.addEventListener('click', () => {
  messagesContainer.innerHTML = ''
})

// Bot simples de simulação
/*
function getBotReply(msg) {
  if (msg.toLowerCase().includes('seu personagem é')) {
    return 'Hmm... talvez!'
  }
  if (msg.includes('?')) {
    return Math.random() > 0.5 ? 'Sim.' : 'Não.'
  }
  return 'Não entendi a pergunta.'
}
*/
// Sair do jogo
leaveGameBtn.addEventListener('click', () => {
  alert('Você saiu do jogo.')
  // Aqui você pode redirecionar ou esconder a tela de jogo

  ws.send(JSON.stringify({
    type: 'msg-end-game',
    de: meuID,
    para: opponent,
  }));

  window.location.href = "lobby.html";
})

// Função para verificar a sessão
/*
async function checkSession() {
  const response = await fetch('/auth/check-session', {
    method: 'GET',
    credentials: 'include', // Inclui cookies na requisição
  })

  if (!response.ok) {
    alert('Sessão expirada. Faça login novamente.')
    window.location.href = '/pages/login.html'
  }
}*/

// Inicialização
checkSession()
setRandomSecretCharacter() // Define o personagem secreto aleatório
initGameScreen()
