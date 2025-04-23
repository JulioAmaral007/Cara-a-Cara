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

// Funções de API compartilhadas
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/user")

    if (!response.ok) {
      return await response.json()
    } else {
      return null
    }
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error)
    return null
  }
}

async function logoutUser() {
  try {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "login.html"
  } catch (error) {
    console.error("Erro de logout:", error)
  }
}

// Funções de utilidade
function getGameDataFromStorage() {
  const gameData = localStorage.getItem("gameData")
  return gameData ? JSON.parse(gameData) : null
}

function saveGameDataToStorage(data) {
  localStorage.setItem("gameData", JSON.stringify(data))
}

function clearGameDataFromStorage() {
  localStorage.removeItem("gameData")
}
