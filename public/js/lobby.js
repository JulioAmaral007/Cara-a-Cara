// Estado do usuário
let currentUser = null

// Inicializar a tela de lobby
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar se o usuário está logado
  const user = await checkAuthStatus()

  if (!user) {
    // Usuário não está logado, redirecionar para a página de login
    // window.location.href = "login.html"
    return
  }

  // Armazenar dados do usuário
  currentUser = user

  // Configurar a interface do usuário
  updateUserInfo()
  updateUserStats()

  // Buscar jogadores online
  fetchOnlinePlayers()

  // Configurar event listeners
  setupEventListeners()
})

async function checkAuthStatus() {
  try {
    const response = await fetch("/api/auth/status")
    if (response.ok) {
      const data = await response.json()
      return data.user
    } else {
      return null
    }
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error)
    return null
  }
}

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

function setupEventListeners() {
  // Botão de logout
  const logoutBtn = document.getElementById("logout-btn")
  logoutBtn.addEventListener("click", logoutUser)

  // Botão de atualizar jogadores
  const refreshPlayersBtn = document.getElementById("refresh-players-btn")
  refreshPlayersBtn.addEventListener("click", fetchOnlinePlayers)
}

async function logoutUser() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      // window.location.href = "login.html"
    } else {
      console.error("Logout failed")
    }
  } catch (error) {
    console.error("Error during logout:", error)
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

function startGame(opponent) {
  // Salvar dados do jogo no localStorage para uso na página do jogo
  const gameData = {
    opponent: opponent,
    currentUser: currentUser,
  }

  saveGameDataToStorage(gameData)

  // Redirecionar para a página do jogo
  window.location.href = "game.html"
}

function saveGameDataToStorage(gameData) {
  localStorage.setItem("gameData", JSON.stringify(gameData))
}
