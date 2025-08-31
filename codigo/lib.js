// Chave usada no localStorage para salvar as músicas
const STORAGE_KEY = "Musify::songs"

// ========================
// Salvar, carregar, limpar os dados
// ========================

// Carrega a lista de músicas do localStorage
const loadSongs = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Salva a lista de músicas no localStorage (convertendo para texto JSON)
const saveSongs = songs =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))

// Remove todas as músicas do localStorage
const clearSongs = () => {
  localStorage.removeItem(STORAGE_KEY)
  console.log("Coleção de músicas limpa.")
}

// Começa do zero com uma lista inicial de músicas
const resetSongs = () => {
  const songs = [
    { id: 1, title: "Bohemian Rhapsody", artist: "Queen", year: 1975, genre: "Rock", album: "A Night at the Opera", duration: 354 },
    { id: 2, title: "Garota de Ipanema", artist: "Tom Jobim & Vinicius de Moraes", year: 1962, genre: "Bossa Nova", album: "Getz/Gilberto", duration: 201 },
    { id: 3, title: "Billie Jean", artist: "Michael Jackson", year: 1982, genre: "Pop", album: "Thriller", duration: 294 },
    { id: 4, title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, genre: "Grunge", album: "Nevermind", duration: 301 },
    { id: 5, title: "No Woman, No Cry", artist: "Bob Marley", year: 1974, genre: "Reggae", album: "Natty Dread", duration: 257 },
    { id: 6, title: "Like a Rolling Stone", artist: "Bob Dylan", year: 1965, genre: "Folk Rock", album: "Highway 61 Revisited", duration: 369 },
    { id: 7, title: "Clube da Esquina Nº 2", artist: "Milton Nascimento & Lô Borges", year: 1972, genre: "MPB", album: "Clube da Esquina", duration: 312 },
    { id: 8, title: "Imagine", artist: "John Lennon", year: 1971, genre: "Soft Rock", album: "Imagine", duration: 183 },
    { id: 9, title: "Yesterday", artist: "The Beatles", year: 1965, genre: "Rock", album: "Help!", duration: 125 },
    { id: 10, title: "Aquarela do Brasil", artist: "Ary Barroso", year: 1939, genre: "Samba", album: "Aquarela do Brasil", duration: 200 },
    { id: 11, title: "Asa Branca", artist: "Luiz Gonzaga", year: 1947, genre: "Forró", album: "Asa Branca", duration: 180 },
    { id: 12, title: "What a Wonderful World", artist: "Louis Armstrong", year: 1967, genre: "Jazz", album: "What a Wonderful World", duration: 140 },
    { id: 13, title: "Hotel California", artist: "Eagles", year: 1976, genre: "Rock", album: "Hotel California", duration: 391 },
    { id: 14, title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, genre: "Rock", album: "Led Zeppelin IV", duration: 482 },
    { id: 15, title: "Águas de Março", artist: "Tom Jobim & Elis Regina", year: 1972, genre: "MPB", album: "Elis & Tom", duration: 149 },
    { id: 16, title: "Detalhes", artist: "Roberto Carlos", year: 1971, genre: "MPB", album: "Detalhes", duration: 230 },
    { id: 17, title: "Construção", artist: "Chico Buarque", year: 1971, genre: "MPB", album: "Construção", duration: 330 },
    { id: 18, title: "O Mundo é um Moinho", artist: "Cartola", year: 1976, genre: "Samba", album: "O Mundo é um Moinho", duration: 180 },
    { id: 19, title: "Trem das Onze", artist: "Adoniran Barbosa", year: 1964, genre: "Samba", album: "Trem das Onze", duration: 150 },
    { id: 20, title: "Sampa", artist: "Caetano Veloso", year: 1978, genre: "MPB", album: "Sampa", duration: 210 },
    { id: 21, title: "Só Tinha de Ser com Você", artist: "Elis Regina & Tom Jobim", year: 1974, genre: "Bossa Nova", album: "Elis & Tom", duration: 195 },
    { id: 22, title: "Rosa", artist: "Pixinguinha", year: 1917, genre: "Choro", album: "Rosa", duration: 160 },
    { id: 23, title: "Thriller", artist: "Michael Jackson", year: 1982, genre: "Pop", album: "Thriller", duration: 358 },
    { id: 24, title: "Let It Be", artist: "The Beatles", year: 1970, genre: "Rock", album: "Let It Be", duration: 243 },
    { id: 25, title: "Evidências", artist: "Chitãozinho & Xororó", year: 1990, genre: "Sertanejo", album: "Evidências", duration: 210 },
    { id: 26, title: "Chega de Saudade", artist: "João Gilberto", year: 1959, genre: "Bossa Nova", album: "Chega de Saudade", duration: 172 },
    { id: 27, title: "O Leãozinho", artist: "Caetano Veloso", year: 1977, genre: "MPB", album: "O Leãozinho", duration: 180 },
    { id: 28, title: "País Tropical", artist: "Jorge Ben Jor", year: 1969, genre: "Samba Rock", album: "País Tropical", duration: 200 },
    { id: 29, title: "Cálice", artist: "Chico Buarque & Gilberto Gil", year: 1973, genre: "MPB", album: "Cálice", duration: 190 },
    { id: 30, title: "Panis et Circenses", artist: "Os Mutantes & Gilberto Gil", year: 1968, genre: "Tropicália", album: "Tropicália", duration: 185 },
    { id: 31, title: "Andar com Fé", artist: "Gilberto Gil", year: 1982, genre: "MPB", album: "Andar com Fé", duration: 210 },
    { id: 32, title: "Menino do Rio", artist: "Caetano Veloso", year: 1979, genre: "MPB", album: "Menino do Rio", duration: 205 },
    { id: 33, title: "Tempo Perdido", artist: "Legião Urbana", year: 1986, genre: "Rock Brasileiro", album: "Dois", duration: 240 },
    { id: 34, title: "Pra Não Dizer que Não Falei das Flores", artist: "Geraldo Vandré", year: 1968, genre: "MPB", album: "Pra Não Dizer que Não Falei das Flores", duration: 260 },
    { id: 35, title: "Apenas Mais Uma de Amor", artist: "Lulu Santos", year: 1986, genre: "Pop Rock", album: "Apenas Mais Uma de Amor", duration: 230 },
    { id: 36, title: "Lanterna dos Afogados", artist: "Paralamas do Sucesso", year: 1989, genre: "Rock Brasileiro", album: "Lanterna dos Afogados", duration: 280 },
    { id: 37, title: "Metamorfose Ambulante", artist: "Raul Seixas", year: 1973, genre: "Rock Brasileiro", album: "Metamorfose Ambulante", duration: 210 },
    { id: 38, title: "Domingo no Parque", artist: "Gilberto Gil", year: 1967, genre: "Tropicália", album: "Domingo no Parque", duration: 240 },
    { id: 39, title: "Flores", artist: "Titãs", year: 1989, genre: "Rock Brasileiro", album: "Flores", duration: 250 },
    { id: 40, title: "Será", artist: "Legião Urbana", year: 1985, genre: "Rock Brasileiro", album: "Será", duration: 230 },
    { id: 41, title: "Gita", artist: "Raul Seixas", year: 1974, genre: "Rock Brasileiro", album: "Gita", duration: 220 },
    { id: 42, title: "Caminhando (Pra Não Dizer que Não Falei das Flores)", artist: "Geraldo Vandré", year: 1968, genre: "Protesto/MPB", album: "Caminhando", duration: 260 },
    { id: 43, title: "Wish You Were Here", artist: "Pink Floyd", year: 1975, genre: "Progressive Rock", album: "Wish You Were Here", duration: 334 },
    { id: 44, title: "Hey Jude", artist: "The Beatles", year: 1968, genre: "Rock", album: "Hey Jude", duration: 431 },
    { id: 45, title: "Lose Yourself", artist: "Eminem", year: 2002, genre: "Hip Hop", album: "8 Mile", duration: 326 },
    { id: 46, title: "Juízo Final", artist: "Nelson Cavaquinho", year: 1973, genre: "Samba", album: "Juízo Final", duration: 180 },
    { id: 47, title: "Canto de Ossanha", artist: "Baden Powell & Vinicius de Moraes", year: 1966, genre: "Bossa Nova", album: "Canto de Ossanha", duration: 210 },
    { id: 48, title: "Killing in the Name", artist: "Rage Against the Machine", year: 1992, genre: "Rap Metal", album: "Rage Against the Machine", duration: 314 },
    { id: 49, title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, genre: "Grunge", album: "Nevermind", duration: 301 },
    { id: 50, title: "Shape of You", artist: "Ed Sheeran", year: 2017, genre: "Pop", album: "divide", duration: 233 }
  ]

  saveSongs(songs)
  console.log("Músicas iniciais salvas com sucesso!")
  return songs
}

// ================================================
// CRUD funcional
// ================================================

// Adiciona uma música nova
const addSong = (songs, newsong) => [...songs, newsong]

// Atualiza uma música existente quando achar o id
const updateSong = (songs, id, updates) =>
  songs.map(song => (song.id === id ? { ...song, ...updates } : song))

// Remove uma música pelo id
const deleteSong = (songs, id) =>
  songs.filter(song => song.id !== id)

// ================================================
// Listagem e formatação
// ================================================

// Lista as músicas em formato de texto simples
const listsongs = songs =>
  songs.map(song => `${song.id} - "${song.title}" (${song.artist}, ${song.year})`).join('\n')

// Lista apenas as músicas de um autor específico
const listsongsByArtist = (songs, artistName) =>
  songs.filter(song => song.artist === artistName)

// Pega a lista de artistas sem repetições
const listSingers = (songs, letra) => {
  const autores = songs.map(song => song.artist);
  const autoresUnicos = autores.filter((value, index, self) => recursiveIndexOf(self, value) === index);
  return autoresUnicos;
}

// Filtra a lista de artistas pela letra inicial
const listSingersByLetters = (songs, letra) => {
  if (!letra || toLower(letra) === "all") {
    return autoresUnicos;
  }
  return autoresUnicos.filter(autor => toLower(autor[0]) === toLower(letra));
}

// Conta quantas músicas cada autor tem
const countsongsByArtist = (songs) =>
  songs.reduce((acc, song) => {
    acc[song.artist] = (acc[song.artist] || 0) + 1
    return acc
  }, {})

// Formata a lista de maneira flexível
const formatsongs = (songs, formatFn) =>
  songs.map((song, index) => formatFn(song, index)).join('\n')

// Formata apenas o título com numeração
const shortFormat = (song, i) => `${i + 1}. ${song.title}`

// Formata id, título, autor e ano
const fullFormat = song =>
  `${song.id} - "${song.title}" (${song.artist}, ${song.year})`

// ================================================
// Transformações adicionais
// ================================================

// Adiciona old:true em músicas antigas
const markOldsongs = (songs, cutoffYear) =>
  songs.map(song => ({ ...song, old: song.year < cutoffYear }))

// Adiciona uma categoria a cada música com base no artista
const addCategoryByArtist = (songs, classifyArtistFn) =>
  songs.map(song => ({ ...song, category: classifyArtistFn(song.artist) }))

// Altera todos os títulos de uma vez
const updateTitles = (songs, transformFn) =>
  songs.map(song => ({ ...song, title: transformFn(song.title) }))

// Permite renomear as chaves dos objetos
const renameFields = (songs, renamerFn) =>
  songs.map(song => renamerFn(song))

// ================================================
// FAVORITOS E PLAYLIST
// ================================================

// Alternar Favoritos
const toggleFavorite = (songs, id) =>
   songs.map(song => song.id === id ? { ...song, favorite: !song.favorite } : song);

// Pega os Favoritos
const getFavoriteSongs = songs => songs.filter(song => song.favorite);

// Cria nova Playlist
const createPlaylist = (playlists, name) => { 
  const newPlaylist = {
    id: Date.now(), name, songs: [], created: new Date().toISOString() 
  }
  return [...playlists, newPlaylist]
}

// Adiciona músicas na Playlist
const addSongToPlaylist = (playlists, playlistId, songId) =>
  playlists.map(playlist =>
    playlist.id === playlistId
      ? { ...playlist, songs: [...playlist.songs, songId] }
      : playlist
  )

// Remove músicas da Plylist
const removeFromPlaylist = (playlists, playlistId, songId) =>
  playlists.map(playlist =>
    playlist.id === playlistId
      ? { ...playlist, songs: playlist.songs.filter(id => id !== songId) }
      : playlist
)

// Deleta Playlist
const deletePlaylist = (playlists, playlistId) =>
  playlists.filter(playlist => playlist.id !== playlistId)

// Pega as músicas de uma Plylist
const getPlaylistSongs = (playlists, playlistId, allsongs) => {
  const playlist = playlists.find(p => p.id === playlistId)
  if (!playlist) return []
  return allsongs.filter(song => playlist.songs.includes(song.id))
}

// ================================================
// FUNÇÕES AUXILIARES
// ================================================

// Acha o índice de um item numa lista
const recursiveIndexOf = (lista, valorBuscado, i = 0) => {
  if (i >= tamanho(lista)) return -1;
  if (lista[i] === valorBuscado) return i;
  return recursiveIndexOf(lista, valorBuscado, i + 1);
}

// Mede o tamanho de uma lista, também com recursão
const tamanho = ([x, ...xs]) => x === undefined ? 0 : 1 + tamanho(xs)

// Versão recursiva do split
const slipAux = (char, separadores, i = 0) => {
  if (i === tamanho(separadores)) { return false }
  if (char === separadores[i]) { return true }
  return slipAux(char, separadores, i + 1)
}

const meuSplit = (texto, separadores, indice = 0, palavraAtual = "") => {
  if (indice === tamanho(texto)) { return palavraAtual === "" ? [] : [palavraAtual] }
  const letra = texto[indice];
  const separador = slipAux(letra, separadores);
  if (separador) {
    return palavraAtual === ""
      ? meuSplit(texto, separadores, indice + 1, "")
      : [palavraAtual, ...meuSplit(texto, separadores, indice + 1, "")]
  } else {
    return meuSplit(texto, separadores, indice + 1, palavraAtual + letra)
  }
}

// Versão recursiva do 'trim'
const buildString = (str, inicio, fim, strNoSpaces = "") => {
  return inicio > fim
    ? strNoSpaces
    : buildString(str, inicio + 1, fim, strNoSpaces + str[inicio])
}

const myStrip = (str, inicio = 0, fim = tamanho(str) - 1) => {
  if (inicio > fim) { return "" }
  if (str[inicio] === " ") { return myStrip(str, inicio + 1, fim) }
  if (str[fim] === " ") { return myStrip(str, inicio, fim - 1) }
  return buildString(str, inicio, fim)
}

// Versão recursiva do lower
const toLowerAux = (letra) => {
  const minusculas = "abcdefghijklmnopqrstuvwxyz"
  const maiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const encontrarLetra = (i = 0) => {
    if (i > tamanho(maiusculas)) { return letra }
    return letra === maiusculas[i]
      ? minusculas[i]
      : encontrarLetra(i + 1)
  }
  return encontrarLetra()
}

const toLower = (texto, inicio = 0, fim = tamanho(texto), resultado = "") => {
  if (inicio === fim) { return resultado }
  const letra = toLowerAux(texto[inicio])
  return toLower(texto, inicio + 1, fim, resultado + letra)
}


// EXPORTAÇÃO 

export const Musify = {
  // Sistema de favoritos e playlist
  toggleFavorite, getFavoriteSongs, createPlaylist, addSongToPlaylist,
  removeFromPlaylist, deletePlaylist, getPlaylistSongs,

  // Funções de salvar/carregar
  loadSongs, saveSongs, resetSongs, clearSongs,

  // CRUD
  addSong, updateSong, deleteSong,

  // Exibição
  listsongs, listsongsByArtist, countsongsByArtist,
  formatsongs, shortFormat, fullFormat, listSingers, listSingersByLetters,

  // Transformações
  markOldsongs, addCategoryByArtist, updateTitles, renameFields
}