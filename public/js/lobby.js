//Websocket setup

const ws = new WebSocket("ws://localhost:3000");

const meuID = sessionStorage.getItem("usuario");

ws.onopen = () => {
  if (meuID) {
    ws.send(JSON.stringify({ type: 'login', nome: meuID }));
  }
};

ws.onmessage = (event) => {
  console.log("Mensagem recebida no cliente:", event.data);
  const data = JSON.parse(event.data);

  if (data.type === 'lista-usuarios') {
    atualizarListaUsuarios(data.usuarios.filter(nome => nome !== meuID));
  }

  if (data.type === 'convite') {
    console.log("Recebido convite de", data.de, "por", meuID);
    const aceitar = confirm(`${data.de} te desafiou para uma partida. Aceitar?`);
    console.log("Resposta confirm foi:", aceitar);
    ws.send(JSON.stringify({
      type: 'respostaDesafio',
      de: meuID,
      para: data.de,
      aceita: aceitar
    }));

    if (aceitar) {
      sessionStorage.setItem("oponente", data.de);
      window.location.href = "game.html";
    }
  }

  if (data.type === 'respostaDesafio') {
    if (data.aceita) {
      sessionStorage.setItem("oponente", data.com);
      window.location.href = "game.html";
    } else {
      alert(`${data.com} recusou seu desafio.`);
    }
  }

};

function atualizarListaUsuarios(nomes) {
  const lista = document.getElementById('players-list');
  const vazio = document.getElementById('no-players-message');

  // Limpa a lista atual
  lista.innerHTML = '';

  if (nomes.length === 0) {
    vazio.classList.remove('hidden');
    return;
  }

  vazio.classList.add('hidden');

  nomes.forEach((nome) => {
    const li = document.createElement('li');
    li.className = 'player-card';

    li.innerHTML = `
      <div class="player-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="player-info">
        <span class="player-name">${nome}</span>
        <span class="player-stats">0 vitórias • 0 jogos</span>
      </div>
      <button class="btn btn-small btn-challenge">
        <i class="fas fa-bolt"></i> Desafiar
      </button>
    `;

    li.querySelector('.btn-challenge').addEventListener('click', () => {
      //alert(`Você desafiou ${nome} para um duelo!`)
      ws.send(JSON.stringify({
        type: 'desafio',
        de: meuID,
        para: nome
      }));
    })

    lista.appendChild(li);
  });
}

 //Fim Websocket

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
async function updateUserInfo() {
  try {
    const response = await fetch('/player/stats', {
      method: 'GET',
      credentials: 'include', // Inclui cookies na requisição
    })
    const data = await response.json()

    userDisplayName.textContent = data.player.username
    userVictories.textContent = `${data.player.victories} vitórias`
    userGames.textContent = `${data.player.gamesPlayed} jogos`

    statVictories.textContent = data.player.victories
    statGames.textContent = data.player.gamesPlayed

    const winRate =
      data.player.gamesPlayed > 0
        ? ((data.player.victories / data.player.gamesPlayed) * 100).toFixed(1)
        : 0

    statWinrate.textContent = `${winRate}%`
  } catch (error) {
    alert('Sessão expirada. Faça login novamente.')
    window.location.href = '/pages/login.html'
  }
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
  //renderPlayers()
  atualizarListaUsuarios(data.usuarios.filter(nome => nome !== meuID))
})

// Simula logout
logoutBtn.addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' })
  ws.send(JSON.stringify({ type: 'log-out', nome: meuID }));
  window.location.href = '/pages/login.html'
})

// // Função para verificar a sessão
// async function checkSession() {
//   try {
//     await fetch('/auth/check-session', {
//       method: 'GET',
//       credentials: 'include', // Inclui cookies na requisição
//     })
//   } catch (error) {
//     alert('Sessão expirada. Faça login novamente.')
//     window.location.href = '/pages/login.html'
//   }
// }

// // Inicialização
// checkSession()
updateUserInfo()
renderPlayers()
