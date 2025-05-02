// Funções de API compartilhadas
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user')

    if (!response.ok) {
      return await response.json()
    } else {
      return null
    }
  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error)
    return null
  }
}

async function logoutUser() {
  try {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = 'login.html'
  } catch (error) {
    console.error('Erro de logout:', error)
  }
}

// Funções de utilidade
function getGameDataFromStorage() {
  const gameData = localStorage.getItem('gameData')
  return gameData ? JSON.parse(gameData) : null
}

function saveGameDataToStorage(data) {
  localStorage.setItem('gameData', JSON.stringify(data))
}

function clearGameDataFromStorage() {
  localStorage.removeItem('gameData')
}
