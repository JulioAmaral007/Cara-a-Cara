// Check de sessão: só permite acesso se estiver logado
if (!sessionStorage.getItem('usuario')) {
  alert('Você precisa estar logado para acessar o jogo.')
  window.location.href = 'login.html' // ou o caminho da sua página de login
}

//Websocket Setup
const ws = new WebSocket('ws://localhost:3000/')

const meuID = sessionStorage.getItem('usuario')
const opponent = sessionStorage.getItem('oponente')

ws.onopen = () => {
  if (meuID) {
    ws.send(JSON.stringify({ type: 'login', nome: meuID }))
  }
}

// Array com os nomes dos personagens
const characterNames = [
  'Susanna',
  'Alfredo',
  'Filippo',
  'Chiara',
  'Paolo',
  'Giuseppe',
  'Samuele',
  'Giorgio',
  'Anita',
  'Manuele',
  'Marco',
  'Riccardo',
  'Tommaso',
  'Alessandro',
  'Carlo',
  'Ernesto',
  'Guglielmo',
  'Maria',
  'Roberto',
  'Pietro',
  'Davide',
  'Bernardo',
  'Anna',
  'Giacomo',
]

ws.onmessage = event => {
  //console.log("Mensagem recebida bruta:", event.data); // 👈 deve aparecer
  const data = JSON.parse(event.data)

  if (data.type === 'msg-receb-game') {
    console.log(`Mensagem recebida: ${data.valor}`)
    writeMessage(data.valor)

    // Verifica se é uma mensagem de adivinhação
    const guessMatch = data.valor.match(/^Seu personagem é (.+)$/i)
    if (guessMatch) {
      const guessedCharacter = guessMatch[1]
      const secretCharacterIndex = Number.parseInt(sessionStorage.getItem('secretCharacterIndex'))
      const correctCharacter = characterNames[secretCharacterIndex]

      if (guessedCharacter.toLowerCase() === correctCharacter.toLowerCase()) {
        // Atualiza as estatísticas no servidor
        updateGameStats(data.de, meuID)
          .then(() => {
            // Envia mensagem de fim de jogo para o oponente
            ws.send(
              JSON.stringify({
                type: 'msg-end-game',
                de: meuID,
                para: opponent,
                winner: data.de, // Quem acertou é o vencedor
                loser: meuID, // Quem teve o personagem adivinhado é o perdedor
              })
            )

            alert('Você perdeu o jogo. Voltando para o lobby...')

            clearGameCharacter()
            window.location.href = 'lobby.html'
          })
          .catch(error => {
            console.error('Erro ao atualizar estatísticas:', error)
            alert('Erro ao atualizar estatísticas do jogo')
          })
      } else {
        // Atualiza as estatísticas no servidor
        updateGameStats(meuID, data.de)
          .then(() => {
            // Envia mensagem de fim de jogo para o oponente
            ws.send(
              JSON.stringify({
                type: 'msg-end-game',
                de: meuID,
                para: opponent,
                winner: meuID, // Quem defendeu é o vencedor
                loser: data.de, // Quem errou é o perdedor
              })
            )

            alert('Parabéns! Você venceu o jogo, o oponente errou seu personagem.')

            clearGameCharacter()
            window.location.href = 'lobby.html'
          })
          .catch(error => {
            console.error('Erro ao atualizar estatísticas:', error)
            alert('Erro ao atualizar estatísticas do jogo')
          })
      }
    }
  }

  // Mensagem de fim de jogo
  if (data.type === 'msg-end-game') {
    console.log('Mensagem de fim de jogo recebida:', data)

    // Verifica se os campos winner e loser existem
    if (data.winner && data.loser) {
      if (data.winner !== meuID) {
        alert('Você perdeu o jogo. Voltando para o lobby...')
      } else if (data.loser !== meuID) {
        alert('Parabéns! Você venceu o jogo.')
      }
    } else {
      // Se não tiver os campos winner e loser, é uma mensagem de saída do jogo
      alert('Jogo encerrado. Voltando para o lobby...')
    }

    clearGameCharacter()
    window.location.href = 'lobby.html'
  }
}

// Função para atualizar as estatísticas do jogo
async function updateGameStats(winner, loser) {
  try {
    const response = await fetch('/game/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        winner: winner,
        loser: loser,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar estatísticas')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Erro ao atualizar estatísticas')
    }

    return data
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

//Fim websocket setup

// DOM Elements
const opponentName = document.getElementById('opponent-name')
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
  addCharacterClickEvents()
  setRandomSecretCharacter()
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

  // Verifica se já existe um personagem no sessionStorage para esta partida
  let randomIndex = sessionStorage.getItem('secretCharacterIndex')

  // Verifica se é uma nova partida (não tem personagem no sessionStorage)
  if (!randomIndex) {
    // Lista de imagens dos personagens
    const characterImages = Array.from({ length: 24 }, (_, i) => `/imgs/f${i + 1}.png`)

    // Seleciona uma imagem aleatória
    randomIndex = Math.floor(Math.random() * characterImages.length)

    // Salva no sessionStorage para persistir durante a partida
    sessionStorage.setItem('secretCharacterIndex', randomIndex)

    // Salva no localStorage para marcar que já geramos um personagem para esta partida
    localStorage.setItem('currentGameCharacter', randomIndex)
  } else {
    // Se já existe um personagem no sessionStorage, verifica se é da mesma partida
    const currentGameCharacter = localStorage.getItem('currentGameCharacter')

    // Se o personagem no sessionStorage for diferente do que está no localStorage,
    // significa que é uma nova partida
    if (currentGameCharacter !== randomIndex) {
      // Gera um novo personagem
      const characterImages = Array.from({ length: 24 }, (_, i) => `/imgs/f${i + 1}.png`)
      randomIndex = Math.floor(Math.random() * characterImages.length)

      // Atualiza tanto o sessionStorage quanto o localStorage
      sessionStorage.setItem('secretCharacterIndex', randomIndex)
      localStorage.setItem('currentGameCharacter', randomIndex)
    }
  }

  const randomImage = `/imgs/f${parseInt(randomIndex) + 1}.png`

  // Define a imagem no personagem secreto
  const imgElement = secretCharacterCard.querySelector('img')
  imgElement.src = randomImage
  imgElement.alt = `Personagem Secreto ${characterNames[parseInt(randomIndex)]}`
}

// Adicione esta função para limpar o personagem quando sair do jogo
function clearGameCharacter() {
  localStorage.removeItem('currentGameCharacter')
  sessionStorage.removeItem('secretCharacterIndex')
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

  ws.send(
    JSON.stringify({
      type: 'msg-env-game',
      de: meuID,
      para: opponent,
      valor: text,
    })
  )
}

function writeMessage(text) {
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

// Sair do jogo
leaveGameBtn.addEventListener('click', () => {
  ws.send(
    JSON.stringify({
      type: 'msg-end-game',
      de: meuID,
      para: opponent,
    })
  )

  clearGameCharacter()
  window.location.href = 'lobby.html'
})

setRandomSecretCharacter() // Define o personagem secreto aleatório
initGameScreen()
