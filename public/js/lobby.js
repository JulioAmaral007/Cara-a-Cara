if (!sessionStorage.getItem('usuario')) {
  alert('Você precisa estar logado para acessar o jogo.')
  window.location.href = 'login.html' // ou o caminho da sua página de login
}
//Websocket setup
const ws = new WebSocket('ws://localhost:3000/')
const meuID = sessionStorage.getItem('usuario')

ws.onopen = () => {
  if (meuID) {
    ws.send(JSON.stringify({ type: 'login', nome: meuID }))
  }
}

ws.onerror = error => {
  console.error('Erro na conexão WebSocket:', error)
}

ws.onclose = () => {
  console.log('Conexão WebSocket fechada')
  // Aqui você pode adicionar lógica de reconexão se desejar
}

ws.onmessage = event => {
  const data = JSON.parse(event.data)

  if (data.type === 'lista-usuarios') {
    atualizarListaUsuarios(data.usuarios.filter(nome => nome !== meuID))
  }

  if (data.type === 'convite') {
    const aceitar = confirm(`${data.de} te desafiou para uma partida. Aceitar?`)
    ws.send(
      JSON.stringify({
        type: 'respostaDesafio',
        de: meuID,
        para: data.de,
        aceita: aceitar,
      })
    )
    if (aceitar) {
      sessionStorage.setItem('oponente', data.de)
      window.location.href = 'game.html'
    }
  }

  if (data.type === 'respostaDesafio') {
    if (data.aceita) {
      sessionStorage.setItem('oponente', data.com)
      window.location.href = 'game.html'
    } else {
      alert(`${data.com} recusou seu desafio.`)
    }
  }
}

// Função para buscar estatísticas de um jogador
async function getPlayerStats(username) {
  try {
    const response = await fetch(`/player/stats?username=${username}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Erro ao buscar estatísticas')
    const data = await response.json()
    return data.player
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { victories: 0, gamesPlayed: 0 }
  }
}

// Atualiza a lista de usuários de forma paralela
async function atualizarListaUsuarios(nomes) {
  const lista = document.getElementById('players-list')
  const vazio = document.getElementById('no-players-message')
  lista.innerHTML = ''

  if (nomes.length === 0) {
    vazio.classList.remove('hidden')
    return
  }
  vazio.classList.add('hidden')

  // Para cada nome na lista, busca as estatísticas e cria o card
  for (const nome of nomes) {
    const stats = await getPlayerStats(nome)

    const li = document.createElement('li')
    li.className = 'player-card'
    li.innerHTML = `
      <div class="player-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="player-info">
        <span class="player-name">${nome}</span>
        <span class="player-stats">${stats.victories} vitórias • ${stats.gamesPlayed} jogos</span>
      </div>
      <button class="btn btn-small btn-challenge">
        <i class="fas fa-bolt"></i> Desafiar
      </button>
    `
    li.querySelector('.btn-challenge').addEventListener('click', () => {
      ws.send(
        JSON.stringify({
          type: 'desafio',
          de: meuID,
          para: nome,
        })
      )
    })
    lista.appendChild(li)
  }
}

//Fim Websocket

// Elementos DOM
const userDisplayName = document.getElementById('user-display-name')
const userVictories = document.getElementById('user-victories')
const userGames = document.getElementById('user-games')
const statVictories = document.getElementById('stat-victories')
const statGames = document.getElementById('stat-games')
const statWinrate = document.getElementById('stat-winrate')
const refreshPlayersBtn = document.getElementById('refresh-players-btn')
const logoutBtn = document.getElementById('logout-btn')

// Atualiza as informações do usuário
async function updateUserInfo() {
  try {
    const response = await fetch('/player/stats', {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error()
    const data = await response.json()
    userDisplayName.textContent = data.player.username
    userVictories.textContent = `${data.player.victories} vitórias`
    userGames.textContent = `${data.player.gamesPlayed} jogos`
    statVictories.textContent = data.player.victories
    statGames.textContent = data.player.gamesPlayed
    const winRate =
      data.player.gamesPlayed > 0 ? ((data.player.victories / data.player.gamesPlayed) * 100).toFixed(1) : 0
    statWinrate.textContent = `${winRate}%`
  } catch (error) {
    alert('Sessão expirada. Faça login novamente.')
    window.location.href = '/pages/login.html'
  }
}

// Eventos
refreshPlayersBtn.addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'get-users' }))
})

logoutBtn.addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' })
  ws.send(JSON.stringify({ type: 'log-out', nome: meuID }))
  window.location.href = '/pages/login.html'
})

// Inicialização
updateUserInfo()
