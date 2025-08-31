import { Musify } from './lib.js';

const FAVOARITES_KEY = 'Musify::favorites'
const PLAYLISTS_KEY = 'Musify::playlists'

// Carrega playlists salvas
let playlists = JSON.parse(localStorage.getItem(PLAYLISTS_KEY)) || []

// ===================================
// Dados e elementos
// ===================================

let allArtistsCache = null;
const imageCache = new Map();
let songs = Musify.loadSongs()
Musify.saveSongs(songs);

// Seleciona elementos HTML que serão manipulados pelo JavaScript
const output = document.getElementById('output');
const forms = document.getElementById('forms');
const buttons = document.getElementById('buttons');
const search = document.getElementById('globalSearch');
const filterGenre = document.getElementById('filterGenre');
const filterDecade = document.getElementById('filterDecade');

// Caso o usuario escreva um caractere especial do HTML ele subistitui pelo equivalente em texto no HTML
function escapeHtml(t) {
  return (t || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

// Transforma segundos em minutos para ser exibido no player
function formatTime(sec) {
  if (!sec) return '0:00'; const m = Math.floor(sec / 60); const s = Math.floor(sec % 60).toString().padStart(2, '0'); return `${m}:${s}`
}

// Balão flutuante
function warningBallon(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '40px';
  toast.style.right = '40px';
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '20px 40px';
  toast.style.borderRadius = '5px';
  toast.style.opacity = '0.9';
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

// timer para não fazer muitas chamadas API ao mesmo tempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// FORMS
// ===================================

function formAddHtml() {
  return `
    <div class="form">
      <input id="f_title" placeholder="Título" />
      <input id="f_artist" placeholder="Artista" />
      <input id="f_album" placeholder="Álbum" />
      <input id="f_duration" placeholder="Duração (segundos)" />
      <textarea id="f_notes" placeholder="Observações (opcional)" rows="2"></textarea>
      <div class="actions">
        <button id="f_add">Adicionar</button>
        <button id="f_cancel">Cancelar</button>
      </div>
    </div>
  `
}

function attachAddHandlers() {
  document.getElementById('f_add').addEventListener('click', () => {
    const t = document.getElementById('f_title').value.trim(),
      a = document.getElementById('f_artist').value.trim(),
      al = document.getElementById('f_album').value.trim(),
      d = Number(document.getElementById('f_duration').value) || 120

    if (!t || !a) {
      alert('Título e artista são obrigatórios');
      return
    }

    const obj = {
      id: Date.now(), // id simples
      title: t,
      artist: a,
      album: al,
      duration: d,
      notes: document.getElementById('f_notes').value.trim()
    }

    let songs = Musify.loadSongs()        // carrega do localStorage
    songs = Musify.addSong(songs, obj)    // adiciona
    Musify.saveSongs(songs)               // salva de volta
    renderList(songs)                     // atualiza a lista

    forms.innerHTML = '' // fecha o formulário
    warningBallon('Música adicionada!')
  })

  document.getElementById('f_cancel').addEventListener('click', () => forms.innerHTML = '')
}

// Função auxiliar para preencher os inputs do formulário de atualização
function fillInputs(song) {
  if (song) {
    document.getElementById("update_title").value = song.title || '';
    document.getElementById("update_artist").value = song.artist || '';
    document.getElementById("update_album").value = song.album || '';
    document.getElementById("update_duration").value = song.duration || 0;
  }
}

// Função para renderizar o formulário de atualização
function showUpdateForm() {
  // Carrega a lista mais recente para garantir que os dados estão atualizados
  let currentSongs = Musify.loadSongs();

  if (currentSongs.length === 0) {
    forms.innerHTML = "<p>Nenhuma música disponível para atualizar.</p>";
    return;
  }

  // Cria a lista de músicas para o menu de seleção
  let options = currentSongs.map(s => `<option value="${s.id}">${s.title} — ${s.artist}</option>`).join("");

  // Formulário de edição
  forms.innerHTML = `
        <div class="form">
            <h3>Atualizar Música</h3>
            <label></label>
            <select id="selectSongToUpdate">${options}</select>
            
            <input id="update_title" placeholder="Título" />
            <input id="update_artist" placeholder="Artista" />
            <input id="update_album" placeholder="Álbum" />
            <input id="update_duration" placeholder="Duração (segundos)" type="number" />
            
            <div class="actions">
                <button id="btnApplyUpdate">Aplicar</button>
                <button id="btnCancelUpdate">Cancelar</button>
            </div>
        </div>
    `;

  const selectElement = document.getElementById("selectSongToUpdate");
  const btnApply = document.getElementById("btnApplyUpdate");
  const btnCancel = document.getElementById("btnCancelUpdate");

  // Preenche os campos do formulário com os dados da música selecionada
  const firstSong = currentSongs.find(s => s.id == selectElement.value);
  fillInputs(firstSong);

  // Se o usuário escolher outra música no menu atualiza os campos
  selectElement.addEventListener("change", () => {
    const selectedId = parseInt(selectElement.value);
    const selectedSong = currentSongs.find(s => s.id === selectedId);
    fillInputs(selectedSong);
  });

  // Aplica a atualização ao clicar no botão
  btnApply.addEventListener("click", () => {
    const songId = parseInt(selectElement.value);

    // Pega tudo que o usuário digitou nos campos
    const updates = {
      title: document.getElementById("update_title").value.trim(),
      artist: document.getElementById("update_artist").value.trim(),
      album: document.getElementById("update_album").value.trim(),
      duration: Number(document.getElementById("update_duration").value) || 0
    };

    // Validação simples
    if (!updates.title || !updates.artist) {
      alert('Título e artista são obrigatórios.');
      return;
    }

    // 1. Atualiza a lista de músicas
    songs = Musify.updateSong(currentSongs, songId, updates);

    // 2. Salva as alterações no localStorage
    Musify.saveSongs(songs);

    // 3. Atualiza a exibição da lista na tela
    renderList(songs);

    // 4. Limpa e fecha o formulário
    forms.innerHTML = "";
  });

  // Cancela a operação e fecha o formulário
  btnCancel.addEventListener("click", () => {
    forms.innerHTML = "";
  });
}

// --- Formulário para remover uma música ---
function showDeleteForm() {
  // Pega a lista atual de músicas
  let currentSongs = Musify.loadSongs();

  // Se não houver música exibe uma mensagem e encerra
  if (currentSongs.length === 0) {
    forms.innerHTML = "<p>Nenhuma música para remover.</p>";
    return;
  }

  // Cria as opções do select com todas as músicas
  const options = currentSongs.map(s =>
    `<option value="${s.id}">${escapeHtml(s.title)} — ${escapeHtml(s.artist)}</option>`
  ).join('');

  // Gera o HTML do formulário
  forms.innerHTML = `
        <div class="form">
            <h3>Remover Música</h3>
            <label></label>
            <select id="selectSongToDelete">${options}</select>
            <div class="actions">
                <button id="btnConfirmDelete">Remover</button>
                <button id="btnCancelDelete">Cancelar</button>
            </div>
        </div>
    `;

  // Adiciona os eventos aos botões
  const selectElement = document.getElementById('selectSongToDelete');

  document.getElementById('btnConfirmDelete').addEventListener('click', () => {
    // Vê qual música o usuário escolheu no menu
    const songId = Number(selectElement.value);

    // Pega os dados da música para a mensagem de confirmação
    const songToDelete = currentSongs.find(s => s.id === songId);

    // Pede confirmação do usuário
    if (confirm(`Tem certeza que deseja remover "${songToDelete.title}"?`)) {
      // Tira a música da lista
      songs = Musify.deleteSong(songs, songId);

      // Salva a nova lista no localStorage
      Musify.saveSongs(songs);

      // Atualiza a exibição na tela
      renderList(songs);

      // Fecha o formulário
      forms.innerHTML = '';
    }
  });

  document.getElementById('btnCancelDelete').addEventListener('click', () => {
    // Fecha o formulário
    forms.innerHTML = '';
  });
}

function action_add() {
  forms.innerHTML = formAddHtml();
  attachAddHandlers();
  attachItunesAutocomplete();
}

function attachItunesAutocomplete() {
  const titleInput = document.getElementById('f_title');
  const artistInput = document.getElementById('f_artist');
  const albumInput = document.getElementById('f_album');
  const formDiv = titleInput.closest('.form');

  // Cria o dropdown de sugestões
  let dropdown = document.createElement('div');
  dropdown.className = 'itunes-dropdown';
  formDiv.appendChild(dropdown);

  async function showSuggestions() {
    // Monta a query combinando os campos preenchidos
    let query = titleInput.value.trim();
    if (artistInput.value.trim()) query += ' ' + artistInput.value.trim();
    if (albumInput.value.trim()) query += ' ' + albumInput.value.trim();

    if (query.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    // Busca sugestões do iTunes
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    dropdown.innerHTML = '';
    if (data.results && data.results.length > 0) {
      data.results.forEach(song => {
        const item = document.createElement('div');
        item.className = 'itunes-suggestion';
        item.innerHTML = `
                      <img src="${song.artworkUrl60}">
                      <div>
                        <b>${song.trackName}</b><br>
                        <span>${song.artistName} • ${song.collectionName}</span>
                      </div>
                      <button class="itunes-add-btn">Adicionar</button>
                    `;
        item.querySelector('.itunes-add-btn').onclick = (e) => {
          e.stopPropagation();
          titleInput.value = song.trackName;
          artistInput.value = song.artistName;
          albumInput.value = song.collectionName;
          document.getElementById('f_duration').value = Math.round(song.trackTimeMillis / 1000) || '';
          dropdown.style.display = 'none';
        };
        item.onclick = () => {
          titleInput.value = song.trackName;
          artistInput.value = song.artistName;
          albumInput.value = song.collectionName;
          document.getElementById('f_duration').value = Math.round(song.trackTimeMillis / 1000) || '';
          dropdown.style.display = 'none';
        };
        dropdown.appendChild(item);
      });
      // Coloca a caixa de sugestões abaixo do formulário
      dropdown.style.top = (formDiv.offsetTop + formDiv.offsetHeight) + 'px';
      dropdown.style.left = formDiv.offsetLeft + 'px';
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  }

  // Atualiza sugestões ao digitar em qualquer campo
  titleInput.addEventListener('input', showSuggestions);
  artistInput.addEventListener('input', showSuggestions);
  albumInput.addEventListener('input', showSuggestions);

  // Se clicar em qualquer outro lugar da página esconde as sugestões
  document.addEventListener('click', (e) => {
    if (!formDiv.contains(e.target)) dropdown.style.display = 'none';
  });
}

function applyFilters() {
  const genre = filterGenre.value;
  const decade = filterDecade.value;
  const query = search.value.trim().toLowerCase();

  let filteredSongs = songs;

  // Filtra por gênero
  if (genre !== 'all') {
    filteredSongs = filteredSongs.filter(s => s.genre === genre);
  }

  // Filtra por década
  if (decade !== 'all') {
    const startYear = Number(decade);
    const endYear = startYear + 9;
    filteredSongs = filteredSongs.filter(s => s.year >= startYear && s.year <= endYear);
  }

  // Filtra pela busca de texto
  if (query) {
    filteredSongs = filteredSongs.filter(s => {
      const text = (s.title + s.artist + (s.album || '')).toLowerCase();
      return text.includes(query);
    });
  }

  renderList(filteredSongs);
}

// ===================================
// RENDERIZAÇÃO
// ===================================
async function generateSongGridHTML(list) {
  if (!list || list.length === 0) {
    return '<div style="color:var(--muted)">Nenhuma música na coleção.</div>';
  }

  const html = ['<div class="song-grid">'];

  // Busca capas prioritamente na API
  const covers = await Promise.all(list.map(async s => {
    // Tenta achar a capa do álbum
    if (s.album) {
      const albumQuery = `${s.album} ${s.artist}`;
      const albumCover = await getItunesAlbumImage(albumQuery);
      if (albumCover) return albumCover;
    }

    // Depois tenta pela música
    const songCover = await getItunesSongImage(s.title, s.artist);
    if (songCover) return songCover;

    // Não usa imagem de artista para capas de músicas
    return null;
  }));

  list.forEach((s, idx) => {
    const coverImg = covers[idx];
    const isFavorite = s.favorite ? '❤' : '🤍';
    s.coverImg = coverImg;

    html.push(`<div class="card">
    <div class="cover">
      ${coverImg
        ? `<img src="${coverImg}" class="cover-img" alt="Capa de ${escapeHtml(s.title)}" loading="lazy">`
        : `<div class="cover-placeholder">${(s.title[0] || 'M').toUpperCase()}</div>`
      }
    </div>
    <div class="meta"><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.artist)} • ${escapeHtml(s.album || '—')} — ${formatTime(s.duration)}</p></div>
    <div style="display:flex;flex-direction:column;gap:6px">
    <button onclick="playItunesPreview('${escapeHtml(s.title)} ${escapeHtml(s.artist)}')">▶</button>
      <button onclick="toggleFavoriteHandler(${s.id})" style="color:${s.favorite ? 'red' : 'inherit'}">${isFavorite}</button>
      <button onclick="showAddToPlaylistDialog(${s.id})">📋</button>
    </div>
    <div id="itunes-preview-${s.id}"></div>
  </div>`);
  });

  html.push('</div>');
  return html.join('\n');
}

async function renderList(list = songs) {
  output.innerHTML = await generateSongGridHTML(list);
}

async function renderArtistsongs(list, container) {
  container.innerHTML = await generateSongGridHTML(list);
}

// ===================================
// SEÇÃO DE ARTISTAS E CHART
// ===================================
// Exibe uma grade de artistas filtrada por letra inicial
function showArtistsGrid(letra = "all") {
  output.innerHTML = `
    <h3 class="artists-title">Selecione um autor</h3>
    <div id="lettersMenu"></div>
    <div id="artistsGrid"></div>
  `;

  // Cria um menu de A a Z para acelerar a pesquisa
  const letters = ["Todos", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  const lettersMenu = document.getElementById('lettersMenu');
  lettersMenu.innerHTML = '';
  letters.forEach(l => {
    const btn = document.createElement('button');
    btn.textContent = l;
    btn.className = 'letter-btn' + ((l === "Todos" && letra === "all") || l === letra ? ' selected' : '');
    btn.onclick = () => showArtistsGrid(l === "Todos" ? "all" : l);
    lettersMenu.appendChild(btn);
  });

  // Guarda a lista de artistas num cache depois da primeira vez
  if (!allArtistsCache) {
    const unsorted = Musify.listSingers(songs);
    allArtistsCache = [...unsorted].sort((a, b) => {
      const cleanA = a.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const cleanB = b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return cleanA.localeCompare(cleanB);
    });
  }

  // Separa só os artistas que começam com a letra escolhida
  const artists = letra === "all"
    ? allArtistsCache // Mostra todos os artistas se "all" foi selecionado
    : allArtistsCache.filter(artist => {
      const firstChar = artist.charAt(0).normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return firstChar === letra.toLowerCase();
    });

  const grid = document.getElementById('artistsGrid');
  grid.innerHTML = '';

  artists.forEach(async artist => {
    const div = document.createElement('div');
    div.className = 'artist-card';

    // Busca imagem da Wikipedia para artistas
    let imgUrl = await fetchBestImage(artist, true);

    let cover;
    if (Array.isArray(imgUrl) && imgUrl.length === 2) {
      // Se for uma dupla mostra as duas fotos divididas
      cover = document.createElement('div');
      cover.className = 'cover artist-img double-img';
      cover.innerHTML = `
    <img src="${imgUrl[0]}" class="half-img" alt="Artista 1">
    <img src="${imgUrl[1]}" class="half-img" alt="Artista 2">
  `;
    } else if (imgUrl) {
      cover = document.createElement('img');
      cover.alt = artist;
      cover.src = imgUrl;
      cover.className = 'artist-img';
      cover.onerror = () => {
        div.removeChild(cover);
        const fallback = document.createElement('div');
        fallback.className = 'cover artist-img';
        fallback.textContent = (artist[0] || 'A').toUpperCase();
        div.prepend(fallback);
      };
    } else {
      cover = document.createElement('div');
      cover.className = 'cover artist-img';
      cover.textContent = (artist[0] || 'A').toUpperCase();
    }

    // Cria o elemento para exibir o nome do artista
    const name = document.createElement('div');
    name.className = 'artist-name';
    name.textContent = artist;

    div.appendChild(cover);
    div.appendChild(name);

    div.addEventListener('click', async () => {
      const artistsongs = songs.filter(b => b.artist === artist);
      output.innerHTML = '';

      const backButton = document.createElement('button');
      backButton.id = 'backToArtists';
      backButton.className = 'back-btn';
      backButton.textContent = '⬅ Voltar';
      backButton.onclick = () => showArtistsGrid(letra);
      output.appendChild(backButton);

      const info = await fetchArtistInfo(artist);

      // Cria um painel com detalhes do artista
      const artistHeader = document.createElement('div');
      artistHeader.className = 'artist-details';
      artistHeader.innerHTML = `
    ${info.imgUrl && !info.imgUrl.endsWith('BohemiaRhapsody.jpg')
          ? `<img src="${info.imgUrl}" alt="${artist}" class="artist-img-large">`
          : `<div class="cover artist-img-large">${(artist[0] || 'A').toUpperCase()}</div>`
        }
        <div>
          <h2 class="artist-details-name">${artist}</h2>
          <div class="artist-details-meta">
            ${info.url ? `<a href="${info.url}" target="_blank">Perfil no Last.fm</a><br>` : ''}
            ${info.listeners ? `<b>Ouvintes:</b> ${info.listeners}<br>` : ''}
            ${info.tags ? `<b>Estilos:</b> ${info.tags}` : ''}
          </div>
        </div>
      `;
      output.appendChild(artistHeader);

      // Cria um espaço para exibir a lista de músicas de um artista
      const songsContainer = document.createElement('div');
      songsContainer.id = 'songsContainer';
      output.appendChild(songsContainer);

      renderArtistsongs(artistsongs, songsContainer);
    });

    grid.appendChild(div);
  });
}

function showArtistChart() {
  output.innerHTML = `<canvas id="artistChart"></canvas>`;
  forms.innerHTML = '';

  const counts = Musify.countsongsByArtist(songs);
  const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);

  // Separa os dados em uma lista com os nomes e outra com a quantiddae
  const labels = sorted.map(([autor]) => autor);
  const data = sorted.map(([_, qtd]) => qtd);
  const colors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

  // Cria o gráfico de barras horizontais usando Chart.js
  const ctx = document.getElementById('artistChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Musicas', data, backgroundColor: colors }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true }, y: { ticks: { autoSkip: false } } }
    }
  });
}

// Função para favoritar/desfavoritar música
function toggleFavoriteHandler(songId) {
  songs = Musify.toggleFavorite(songs, songId)
  Musify.saveSongs(songs)
  renderList(songs)
  warningBallon('Favoritos atualizados!')
}

// Função para mostrar músicas favoritas
function showFavorites() {
  const favorites = Musify.getFavoriteSongs(songs)
  if (favorites.length === 0) {
    output.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px">Nenhuma música favoritada ainda.</div>'
  } else {
    renderList(favorites)
  }
  forms.innerHTML = ''
}

// Funções para gerenciar playlists
function showPlaylistsManager() {
  output.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3>Suas Playlists</h3>
      <button onclick="showCreatePlaylistForm()" style="padding:8px 16px">+ Nova Playlist</button>
    </div>
    <div id="playlistsContainer"></div>
  `
  
  renderPlaylists()
  forms.innerHTML = ''
}

function renderPlaylists() {
  const container = document.getElementById('playlistsContainer')
  if (!container) return
  
  if (playlists.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px">Nenhuma playlist criada ainda.</div>'
    return
  }
  
  container.innerHTML = playlists.map(playlist => `
    <div class="card" style="margin-bottom:12px">
      <div style="flex:1">
        <h4>${escapeHtml(playlist.name)}</h4>
        <p>${playlist.songs.length} música(s) • Criada em ${new Date(playlist.created).toLocaleDateString()}</p>
      </div>
      <div style="display:flex;gap:6px;flex-direction:column">
        <button onclick="viewPlaylist(${playlist.id})">👀 Ver</button>
        <button onclick="deletePlaylistHandler(${playlist.id})">🗑 Excluir</button>
      </div>
    </div>
  `).join('')
}

function createPlaylistHandler() {
  const name = document.getElementById('playlistName').value.trim()
  if (!name) {
    alert('Digite um nome para a playlist')
    return
  }
  
  playlists = Musify.createPlaylist(playlists, name)
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  renderPlaylists()
  forms.innerHTML = ''
  warningBallon('Playlist criada!')
}

function deletePlaylistHandler(playlistId) {
  if (confirm('Tem certeza que deseja excluir esta playlist?')) {
    playlists = Musify.deletePlaylist(playlists, playlistId)
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
    renderPlaylists()
    warningBallon('Playlist excluída!')
  }
}

function viewPlaylist(playlistId) {
  const playlistSongs = Musify.getPlaylistSongs(playlists, playlistId, songs)
  if (playlistSongs.length === 0) {
    output.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px">Playlist vazia.</div>'
  } else {
    renderList(playlistSongs)
  }
  forms.innerHTML = ''
}

function showAddToPlaylistDialog(songId) {
  if (playlists.length === 0) {
    alert('Crie uma playlist primeiro!')
    showPlaylistsManager()
    return
  }
  
  forms.innerHTML = `
    <div class="form">
      <h3>Adicionar à Playlist</h3>
      <select id="playlistSelect">
        ${playlists.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
      </select>
      <div class="actions">
        <button onclick="addToPlaylistHandler(${songId})">Adicionar</button>
        <button onclick="forms.innerHTML=''">Cancelar</button>
      </div>
    </div>
  `
}

function addToPlaylistHandler(songId) {
  const playlistId = parseInt(document.getElementById('playlistSelect').value)
  playlists = Musify.addSongToPlaylist(playlists, playlistId, songId)
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  forms.innerHTML = ''
  warningBallon('Música adicionada à playlist!')
}

function showCreatePlaylistForm() {
  forms.innerHTML = `
    <div class="form">
      <h3>Nova Playlist</h3>
      <input id="playlistName" placeholder="Nome da playlist" />
      <div class="actions">
        <button onclick="createPlaylistHandler()">Criar</button>
        <button onclick="forms.innerHTML=''">Cancelar</button>
      </div>
    </div>
  `
}

// ===================================
// API
// ===================================
// Função para buscar dados de API
async function fetchApi(url) {
  try {
    // Verifica se a URL já está no cache
    if (imageCache.has(url)) {
      return imageCache.get(url);
    }

    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    imageCache.set(url, data);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${url}:`, error);
    return {};
  }
}

function enqueue(songId) {
  const song = songs.find(s => s.id === songId)
  if (song) {
    queue.push(song)
    queueCount.textContent = queue.length
    warningBallon('Música adicionada à fila!')
  }
}

async function fetchItunesPreview(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
  const data = await fetchApi(url);
  const result = data.results?.[0];
  return result?.previewUrl || null;
}

async function getItunesAlbumImage(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=1`;
  const data = await fetchApi(url);
  if (data.results && data.results.length > 0) {
    // Consegue uma imagem de resolução melhor
    return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
  }
  return null;
}

async function getItunesSongImage(title, artist) {
  const query = `${title} ${artist}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
  const data = await fetchApi(url);
  if (data.results && data.results.length > 0) {
    // Consegue uma imagem de resolução melhor
    return data.results[0].artworkUrl100?.replace('100x100bb', '600x600bb');
  }
  return null;
}

async function getWikiImage(query) {
  const cleanQuery = query.replace(/^(os|as|the)\s+/i, '').trim();
  // Se for colaboração, busca para cada artista
  if (query.includes('&')) {
    const parts = query.split('&').map(p => p.trim());
    const images = [];
    for (const part of parts) {
      const img = await getWikiImage(part);
      if (img) images.push(img);
      await sleep(200);
    }
    return images.length > 0 ? images : null;
  }

  const andQuery = cleanQuery.replace(/&/g, 'and');
  const noSpaceQuery = cleanQuery.replace(/\s+/g, '');
  const asciiQuery = cleanQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const variants = [
    query, cleanQuery, andQuery, noSpaceQuery, asciiQuery,
    `${cleanQuery} (band)`, `${cleanQuery} (group)`, `${cleanQuery} (duo)`,
    `${cleanQuery} (musician)`, `${cleanQuery} (singer)`, `${cleanQuery} (artist)`,
    `${cleanQuery} (rapper)`, `${cleanQuery} (composer)`, `${cleanQuery} (producer)`,
    `${cleanQuery} (DJ)`, `${andQuery} (band)`, `${andQuery} (group)`, `${andQuery} (duo)`,
    `${asciiQuery} (band)`, `${asciiQuery} (group)`, `${asciiQuery} (duo)`
  ];

  for (const variant of variants) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(variant)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
    const data = await fetchApi(url);
    if (data.query && data.query.pages) {
      const pages = data.query.pages;
      for (const pageId in pages) {
        if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }
    await sleep(200);
  }
  return null;
}

async function getLastFmArtistImage(artistName) {
  const apiKey = '254828efebce648b8c698471e2cd36d0';
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&autocorrect=1`;
  const data = await fetchApi(url);
  const artist = data.artist;
  if (artist && artist.image && artist.image.length > 0) {
    const imgObj = artist.image.reverse().find(img =>
      img['#text'] && !img['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f.png')
    );
    if (imgObj && imgObj['#text']) return imgObj['#text'];
  }
  return null;
}

// Função para buscar a melhor imagem
async function fetchBestImage(query, isArtist = false) {
  try {
    // Se for uma busca por artista, prioriza a Wikipedia
    if (isArtist) {
      try {
        // Primeiro tenta no Wikipedia.
        const wikiImg = await getWikiImage(query);
        if (wikiImg) return wikiImg;
      } catch (e) {
        console.log("Erro ao buscar imagem da Wikipedia:", e);
      }

      try {
        // Depois no Last.fm.
        const lastFmImg = await getLastFmArtistImage(query);
        if (lastFmImg) return lastFmImg;
      } catch (e) {
        console.log("Erro ao buscar imagem no Last.fm:", e);
      }
    }
    // Para álbuns e músicas, prioriza o iTunes
    else {
      try {
        // Busca diretamente no iTunes para álbuns/músicas
        const itunesImg = await getItunesAlbumImage(query);
        if (itunesImg) return itunesImg;
      } catch (e) {
        console.log("Erro ao buscar imagem do álbum no iTunes:", e);
      }
    }

    // Retorna null se não achar a imagem
    return null;
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    return null;
  }
}

// Busca informações
async function fetchArtistInfo(artist) {
  // Busca imagem específica na Wikipedia para artistas
  const imgUrl = await fetchBestImage(artist, true);

  // Busca dados do Last.fm
  const apiKey = '254828efebce648b8c698471e2cd36d0';
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json&autocorrect=1`;
  const data = await fetchApi(url);

  return {
    imgUrl,
    url: data.artist?.url,
    listeners: data.artist?.stats?.listeners,
    tags: data.artist?.tags?.tag?.map(t => t.name).join(', ')
  };
}

// ===================================
// ACTIONS
// ===================================
const actions = {
  init: () => {
    songs = Musify.resetSongs();
    renderList(songs);
    forms.innerHTML = "";
  },
  list: () => { forms.innerHTML = ''; renderList(songs); },
  add: () => { action_add(); },
  update: () => { showUpdateForm(); },
  delete: () => showDeleteForm(),
  clear: () => { forms.innerHTML = ''; Musify.clearSongs(); songs = []; output.textContent = 'Musify esvaziada.'; },
  browseByArtist: () => showArtistsGrid(),
  countByArtist: () => showArtistChart(),
  favorites: () => showFavorites(),
  playlists: () => showPlaylistsManager(),
  exit: () => { forms.innerHTML = ''; output.textContent = 'Bye, bye! :)'; }
};

// ===================================
// EVENT LISTENER
// ===================================
// Captura cliques nos botões do menu e chama a ação correspondente
buttons.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const action = e.target.dataset.action; // Descobre qual botão foi clicado
    if (action && actions[action]) actions[action](); // Executa a função correspondente
  }
});

search.addEventListener('input', () => {
 applyFilters();
});

filterGenre.addEventListener('change', applyFilters);
filterDecade.addEventListener('change', applyFilters);

// ===================================
// LÓGICA DO PLAYER DE MÚSICA
// ===================================
window.deletePlaylistHandler = deletePlaylistHandler
window.viewPlaylist = viewPlaylist
window.addToPlaylistHandler = addToPlaylistHandler
window.createPlaylistHandler = createPlaylistHandler
window.showCreatePlaylistForm = showCreatePlaylistForm
window.toggleFavoriteHandler = toggleFavoriteHandler
window.showAddToPlaylistDialog = showAddToPlaylistDialog
window.enqueue = enqueue
window.playItunesPreview = async function (query) {
  const previewUrl = await fetchItunesPreview(query);
  const song = songs.find(s => `${s.title} ${s.artist}` === query);
  const playerPanel = document.getElementById('playerPanel');

  if (!playerPanel) return;

  if (previewUrl && song) {
    const coverHTML = song.coverImg
      ? `<img src="${song.coverImg}" class="cover-img" alt="Capa de ${song.title}">`
      : (song.title.charAt(0) || 'M').toUpperCase();

    playerPanel.innerHTML = `
  <div id="nowPlaying" class="np-row" style="gap:18px;align-items:center;">
    <div class="cover" id="npCover">${coverHTML}</div>
    <div style="flex:1;min-width:0;">
      <h3 id="npTitle" style="margin:0 0 6px 0">${song.title}</h3>
      <div id="npArtist" style="color:var(--muted);margin-bottom:10px;">${song.artist}</div>
      <div class="custom-audio-player" style="display:flex;align-items:center;gap:10px;">
        <button id="audioPlayPause" class="audio-btn">⏵</button>
        <span id="audioCurrent">0:00</span>
        <input type="range" id="audioSeek" value="0" min="0" max="100" style="flex:1; margin:0 8px;">
        <span id="audioTotal">0:00</span>
      </div>
      <audio id="itunesAudio" src="${previewUrl}" style="display:none"></audio>
    </div>
  </div>
`;

    // Conecta os botões com o player de áudio
    const audio = document.getElementById('itunesAudio');
    const playPauseBtn = document.getElementById('audioPlayPause');
    const current = document.getElementById('audioCurrent');
    const total = document.getElementById('audioTotal');
    const seek = document.getElementById('audioSeek');

    audio.addEventListener('loadedmetadata', () => {
      total.textContent = formatTime(audio.duration);
      seek.max = Math.floor(audio.duration);
      seek.value = 0;
    });

    audio.addEventListener('timeupdate', () => {
      current.textContent = formatTime(audio.currentTime);
      seek.value = Math.floor(audio.currentTime);
      playPauseBtn.textContent = audio.paused ? '⏵' : '⏸';
    });

    playPauseBtn.onclick = () => {
      if (audio.paused) audio.play();
      else audio.pause();
    };

    seek.oninput = () => {
      audio.currentTime = seek.value;
    };

    audio.play();

  } else if (song) {
    playerPanel.innerHTML = `
      <div id="nowPlaying">
        <div class="np-row">
          <div class="cover" id="npCover">M</div>
          <div style="flex:1">
            <div id="npTitle"><h3 style="margin:0 0 6px 0">Prévia não encontrada</h3></div>
            <div id="npArtist" style="color:var(--muted)">${song.artist}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    playerPanel.innerHTML = `
      <div id="nowPlaying">
        <div class="np-row">
          <div class="cover" id="npCover">M</div>
          <div style="flex:1">
            <div id="npTitle"><h3 style="margin:0 0 6px 0">Nenhuma música</h3></div>
            <div id="npArtist" style="color:var(--muted)"></div>
          </div>
        </div>
      </div>
    `;
  }
};