document.addEventListener('DOMContentLoaded', () => {
  // Alternar entre abas (login e registro)
  const tabButtons = document.querySelectorAll('.tab-btn')
  const tabContents = document.querySelectorAll('.tab-content')

  // biome-ignore lint/complexity/noForEach: <explanation>
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Alterna botão ativo
      // biome-ignore lint/complexity/noForEach: <explanation>
      tabButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')

      // Alterna conteúdo
      const target = button.dataset.tab
      // biome-ignore lint/complexity/noForEach: <explanation>
      tabContents.forEach(tab => {
        tab.classList.remove('active')
        if (tab.id === `${target}-tab`) tab.classList.add('active')
      })
    })
  })

  // Lógica do login
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault()

    const usernameInput = document.getElementById('login-username')
    const passwordInput = document.getElementById('login-password')
    const errorMessage = document.getElementById('login-error') // Elemento para exibir o erro

    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()

    if (!username || !password) {
      errorMessage.textContent = 'Por favor, preencha todos os campos.'
      errorMessage.classList.add('show') // Adiciona a classe 'show' para exibir a mensagem
      return
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const { message } = await response.json()
        errorMessage.textContent = message || 'Usuário ou senha inválidos.'
        errorMessage.classList.add('show') // Exibe a mensagem de erro
        return
      }

      // Limpa os campos do formulário e a mensagem de erro
      usernameInput.value = ''
      passwordInput.value = ''
      errorMessage.textContent = ''
      errorMessage.classList.remove('show') // Remove a classe 'show'

      // Redireciona para o lobby após login bem-sucedido
      window.location.href = 'lobby.html'
    } catch (error) {
      console.error('Erro no login:', error)
      errorMessage.textContent = 'Erro ao tentar fazer login.'
      errorMessage.classList.add('show') // Exibe a mensagem de erro
    }
  })

  // Lógica do registro
  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault()

    const usernameInput = document.getElementById('register-username')
    const passwordInput = document.getElementById('register-password')
    const confirmPasswordInput = document.getElementById('register-confirm-password')

    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()
    const confirmPassword = confirmPasswordInput.value.trim()

    if (!username || !password || !confirmPassword) {
      alert('Preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.')
      return
    }

    try {
      // Envia os dados para a rota de registro no servidor
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const { error, details } = await response.json()
        alert(error || 'Erro ao registrar.')
        console.error('Detalhes do erro:', details)
        return
      }

      // Limpa os campos do formulário
      usernameInput.value = ''
      passwordInput.value = ''
      confirmPasswordInput.value = ''

      // Alterna para a aba de login
      document.querySelector('[data-tab="login"]').click()
    } catch (error) {
      console.error('Erro no registro:', error)
      alert('Erro ao tentar registrar.')
    }
  })
})
