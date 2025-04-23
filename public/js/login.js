document.addEventListener('DOMContentLoaded', () => {
  // Alternar entre abas (login e registro)
  const tabButtons = document.querySelectorAll('.tab-btn')
  const tabContents = document.querySelectorAll('.tab-content')

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Alterna botão ativo
      tabButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')

      // Alterna conteúdo
      const target = button.dataset.tab
      tabContents.forEach(tab => {
        tab.classList.remove('active')
        if (tab.id === `${target}-tab`) tab.classList.add('active')
      })
    })
  })

  // Lógica do login
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault()

    const username = document.getElementById('login-username').value.trim()
    const password = document.getElementById('login-password').value.trim()

    if (!username || !password) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    try {
      // Exemplo de envio para API (substituir por sua URL real)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const { message } = await response.json()
        alert(message || 'Usuário ou senha inválidos.')
        return
      }

      // Redireciona para o lobby após login bem-sucedido
      window.location.href = 'lobby.html'
    } catch (error) {
      console.error('Erro no login:', error)
      alert('Erro ao tentar fazer login.')
    }
  })

  // Lógica do registro
  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault()

    const username = document.getElementById('register-username').value.trim()
    const password = document.getElementById('register-password').value.trim()
    const confirmPassword = document.getElementById('register-confirm-password').value.trim()

    if (!username || !password || !confirmPassword) {
      alert('Preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.')
      return
    }

    try {
      // Exemplo de envio para API (substituir por sua URL real)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const { message } = await response.json()
        alert(message || 'Erro ao registrar.')
        return
      }

      alert('Registro realizado com sucesso! Faça login.')
      // Alterna para a aba de login
      document.querySelector('[data-tab="login"]').click()
    } catch (error) {
      console.error('Erro no registro:', error)
      alert('Erro ao tentar registrar.')
    }
  })
})
