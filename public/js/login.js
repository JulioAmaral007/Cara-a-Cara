// Configurar abas de Login/Registro
document.addEventListener("DOMContentLoaded", () => {
  // Import checkAuthStatus from auth.js
  import("./auth.js").then((module) => {
    const checkAuthStatus = module.checkAuthStatus

    setupLoginRegisterTabs()
    setupFormSubmissions()

    // Verificar se o usuário já está logado
    checkAuthStatus().then((user) => {
      if (user) {
        // Usuário já está logado, redirecionar para o lobby
        window.location.href = "lobby.html"
      }
    })
  })
})

function setupLoginRegisterTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab")

      // Atualizar botão da aba ativa
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Mostrar o conteúdo da aba selecionada
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabName}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })
}

function setupFormSubmissions() {
  // Formulário de login
  const loginForm = document.getElementById("login-form")
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value

    loginUser(username, password)
  })

  // Formulário de registro
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

    registerUser(username, password)
  })
}

async function loginUser(username, password) {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      // Redirecionar para o lobby após login bem-sucedido
      window.location.href = "lobby.html"
    } else {
      const error = await response.json()
      alert(error.message || "Falha no login. Verifique suas credenciais.")
    }
  } catch (error) {
    console.error("Erro de login:", error)
    alert("Erro ao conectar com o servidor. Tente novamente mais tarde.")
  }
}

async function registerUser(username, password) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      // Redirecionar para o lobby após registro bem-sucedido
      window.location.href = "lobby.html"
    } else {
      const error = await response.json()
      alert(error.message || "Falha no registro. Tente outro nome de usuário.")
    }
  } catch (error) {
    console.error("Erro de registro:", error)
    alert("Erro ao conectar com o servidor. Tente novamente mais tarde.")
  }
}
