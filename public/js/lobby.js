// Simula dados do usuário atual
const currentUser = {
  name: 'PlayerAtual',
  victories: 18,
  games: 42,
}

// Simula lista de jogadores online
const playersOnline = [
  { name: 'Jogador1', victories: 12, games: 30 },
  { name: 'JogadoraPro', victories: 24, games: 50 },
  { name: 'NoobMaster69', victories: 3, games: 15 },
]

// Elementos DOM
const userDisplayName = document.getElementById('user-display-name')
const userVictories = document.getElementById('user-victories')
const userGames = document.getElementById('user-games')

const statVictories = document.getElementById('stat-victories')
const statGames = document.getElementById('stat-games')
const statWinrate = document.getElementById('stat-winrate')

const playersList = document.getElementById('players-list')
const noPlayersMessage = document.getElementById('no-players-message')

const refreshPlayersBtn = document.getElementById('refresh-players-btn')
const logoutBtn = document.getElementById('logout-btn')

// Função para atualizar os dados do usuário
function updateUserInfo() {
  userDisplayName.textContent = currentUser.name
  userVictories.textContent = `${currentUser.victories} vitórias`
  userGames.textContent = `${currentUser.games} jogos`

  statVictories.textContent = currentUser.victories
  statGames.textContent = currentUser.games

  const winRate =
    currentUser.games > 0 ? ((currentUser.victories / currentUser.games) * 100).toFixed(1) : 0

  statWinrate.textContent = `${winRate}%`
}

// Função para renderizar os cards de jogadores
function renderPlayers() {
  playersList.innerHTML = ''

  if (playersOnline.length === 0) {
    noPlayersMessage.classList.remove('hidden')
    return
  }
  noPlayersMessage.classList.add('hidden')

  // biome-ignore lint/complexity/noForEach: <explanation>
  playersOnline.forEach(player => {
    const li = document.createElement('li')
    li.className = 'player-card'
    li.innerHTML = `
      <div class="player-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="player-info">
        <span class="player-name">${player.name}</span>
        <span class="player-stats">${player.victories} vitórias • ${player.games} jogos</span>
      </div>
      <button class="btn btn-small btn-challenge">
        <i class="fas fa-bolt"></i> Desafiar
      </button>
    `

    li.querySelector('.btn-challenge').addEventListener('click', () => {
      alert(`Você desafiou ${player.name} para um duelo!`)
    })

    playersList.appendChild(li)
  })
}

// Simula atualização da lista
refreshPlayersBtn.addEventListener('click', () => {
  // Você poderia buscar dados do servidor aqui
  alert('Lista de jogadores atualizada!')
  renderPlayers()
})

// Simula logout
logoutBtn.addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' })
  window.location.href = '/pages/login.html'
})

// Função para verificar a sessão
async function checkSession() {
  try {
    await fetch('/auth/check-session', {
      method: 'GET',
      credentials: 'include', // Inclui cookies na requisição
    })
  } catch (error) {
    alert('Sessão expirada. Faça login novamente.')
    window.location.href = '/pages/login.html'
  }
}

// Inicialização
checkSession()
updateUserInfo()
renderPlayers()
