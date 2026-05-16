const audio = document.querySelector("#audio");
const fileInput = document.querySelector("#fileInput");
const playlistEl = document.querySelector("#playlist");
const emptyState = document.querySelector("#emptyState");
const trackCount = document.querySelector("#trackCount");
const albumCount = document.querySelector("#albumCount");
const songCount = document.querySelector("#songCount");
const sidebarLibraryCount = document.querySelector("#sidebarLibraryCount");
const libraryStatus = document.querySelector("#libraryStatus");
const albumGrid = document.querySelector("#albumGrid");
const favoritesCard = document.querySelector("#favoritesCard");
const favoritesMeta = document.querySelector("#favoritesMeta");
const favoritesPreview = document.querySelector("#favoritesPreview");
const favoritesDetail = document.querySelector("#favoritesDetail");
const favoritesDetailMeta = document.querySelector("#favoritesDetailMeta");
const favoritesSongList = document.querySelector("#favoritesSongList");
const songGrid = document.querySelector("#songGrid");
const albumDetail = document.querySelector("#albumDetail");
const albumDetailTitle = document.querySelector("#albumDetailTitle");
const albumDetailMeta = document.querySelector("#albumDetailMeta");
const albumSongList = document.querySelector("#albumSongList");
const playAlbumBtn = document.querySelector("#playAlbumBtn");
const shuffleAllBtn = document.querySelector("#shuffleAllBtn");
const statusText = document.querySelector("#statusText");
const trackTitle = document.querySelector("#trackTitle");
const trackMeta = document.querySelector("#trackMeta");
const seek = document.querySelector("#seek");
const currentTimeEl = document.querySelector("#currentTime");
const durationEl = document.querySelector("#duration");
const volume = document.querySelector("#volume");
const playBtn = document.querySelector("#playBtn");
const playIcon = document.querySelector("#playIcon");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const shuffleBtn = document.querySelector("#shuffleBtn");
const favoriteBtn = document.querySelector("#favoriteBtn");
const repeatBtn = document.querySelector("#repeatBtn");
const muteBtn = document.querySelector("#muteBtn");
const clearBtn = document.querySelector("#clearBtn");
const playerEl = document.querySelector(".player");
const queueEl = document.querySelector(".queue");
const githubForm = document.querySelector("#githubForm");
const repoInput = document.querySelector("#repoInput");
const branchInput = document.querySelector("#branchInput");
const pathInput = document.querySelector("#pathInput");
const tokenInput = document.querySelector("#tokenInput");
const githubLoadBtn = document.querySelector("#githubLoadBtn");
const githubStatus = document.querySelector("#githubStatus");
const canvas = document.querySelector("#visualizer");
const disc = document.querySelector(".disc");
const ctx = canvas.getContext("2d");
const audioExtensions = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "opus", "webm"]);
const imageExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const defaultGithubAlbums = [
  { repo: "MoinYesin/ts_midnights_player", album: "Midnights" },
  { repo: "MoinYesin/ts_reputation_player", album: "Reputation" },
  { repo: "MoinYesin/ts_1989tv_player", album: "1989 TV" },
  { repo: "MoinYesin/ts_lover_player", album: "Lover" }
];
const playCountsKey = "taylorAlbumsPlayCounts";
const lastPlayedKey = "taylorAlbumsLastPlayed";
const favoritesKey = "taylorAlbumsFavorites";
const mostPlayedLimit = 10;

let tracks = [];
let currentIndex = -1;
let isSeeking = false;
let shuffle = false;
let repeat = false;
let audioContext;
let analyser;
let source;
let frequencyData;
let githubToken = "";
let playCounts = readPlayCounts();
let countedTrackId = "";
let selectedAlbumName = "";
let pendingSeekTime = 0;
let shuffleQueueIndices = [];
let shuffleQueueMode = "";
let swipeStartY = 0;
let lastScrollY = window.scrollY;
let favorites = readFavorites();
let favoritesOpen = false;
let lastOpenedPanel = "";
let lastMediaPositionUpdate = 0;

function hasMediaSession() {
  return "mediaSession" in navigator;
}

function artworkMimeType(src) {
  const ext = (() => {
    try {
      const url = new URL(src, window.location.href);
      const parts = url.pathname.split(".");
      return (parts.length > 1 ? parts.pop() : "").toLowerCase();
    } catch {
      const clean = String(src).split("?")[0].split("#")[0];
      const parts = clean.split(".");
      return (parts.length > 1 ? parts.pop() : "").toLowerCase();
    }
  })();

  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  if (ext === "svg") return "image/svg+xml";
  return "image/jpeg";
}

function setMediaMetadata(track) {
  if (!hasMediaSession() || !track) return;
  const artist = track.source === "github" ? "Taylor Swift" : "Local files";
  const artworkSrc = track.coverUrl || "";
  const artworkType = artworkSrc ? artworkMimeType(artworkSrc) : "";
  const artwork = artworkSrc
    ? [
      { src: artworkSrc, sizes: "96x96", type: artworkType },
      { src: artworkSrc, sizes: "192x192", type: artworkType },
      { src: artworkSrc, sizes: "512x512", type: artworkType }
    ]
    : [];

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist,
      album: track.album || "",
      artwork
    });
  } catch {
    // Ignore if MediaMetadata is unavailable.
  }
}

function setMediaPlaybackState() {
  if (!hasMediaSession()) return;
  navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
}

function setMediaPositionState() {
  if (!hasMediaSession()) return;
  if (typeof navigator.mediaSession.setPositionState !== "function") return;
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  navigator.mediaSession.setPositionState({
    duration: audio.duration,
    playbackRate: audio.playbackRate || 1,
    position: audio.currentTime || 0
  });
}

function installMediaActionHandlers() {
  if (!hasMediaSession() || installMediaActionHandlers.installed) return;
  installMediaActionHandlers.installed = true;

  const safeSet = (action, handler) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Some actions may not be supported.
    }
  };

  safeSet("play", () => playAudio());
  safeSet("pause", () => pauseAudio());
  safeSet("previoustrack", () => previousTrack());
  safeSet("nexttrack", () => nextTrack());
  safeSet("seekbackward", (details) => {
    const step = details?.seekOffset ?? 10;
    audio.currentTime = Math.max((audio.currentTime || 0) - step, 0);
    setMediaPositionState();
  });
  safeSet("seekforward", (details) => {
    const step = details?.seekOffset ?? 10;
    audio.currentTime = Math.min((audio.currentTime || 0) + step, audio.duration || 0);
    setMediaPositionState();
  });
  safeSet("seekto", (details) => {
    if (!Number.isFinite(details?.seekTime)) return;
    if (typeof audio.fastSeek === "function" && details.fastSeek) audio.fastSeek(details.seekTime);
    else audio.currentTime = details.seekTime;
    setMediaPositionState();
  });
  safeSet("stop", () => {
    pauseAudio();
    audio.currentTime = 0;
    setMediaPositionState();
    setMediaPlaybackState();
  });
}

audio.volume = Number(volume.value);

function makeId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readPlayCounts() {
  try {
    return JSON.parse(localStorage.getItem(playCountsKey)) || {};
  } catch {
    return {};
  }
}

function savePlayCounts() {
  localStorage.setItem(playCountsKey, JSON.stringify(playCounts));
}

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoritesKey)) || {};
  } catch {
    return {};
  }
}

function saveFavorites() {
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

function isFavorite(track) {
  if (!track) return false;
  return Boolean(favorites[track.key]);
}

function toggleFavorite(track) {
  if (!track) return;
  if (isFavorite(track)) delete favorites[track.key];
  else favorites[track.key] = true;
  saveFavorites();
  updateFavoriteButton();
  renderHome();
  renderPlaylist();
}

function readLastPlayed() {
  try {
    return JSON.parse(localStorage.getItem(lastPlayedKey)) || null;
  } catch {
    return null;
  }
}

function saveLastPlayed() {
  const track = tracks[currentIndex];
  if (!track) return;
  localStorage.setItem(lastPlayedKey, JSON.stringify({
    key: track.key,
    time: Math.floor(audio.currentTime || 0)
  }));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function formatBytes(bytes) {
  if (!bytes) return "Local file";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index ? 1 : 0)} ${units[index]}`;
}

function cleanName(fileName) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function formatSongTitle(fileName) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const withoutTrackNumber = withoutExtension.replace(/^\s*\d{2,3}\s+/, "");
  return withoutTrackNumber
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function cleanPathName(pathName) {
  return cleanName(pathName || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function albumFromPath(path, fallback = "Taylor Albums") {
  if (!path) return fallback;
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return fallback;
  return cleanPathName(parts[parts.length - 2]);
}

function albumTheme(albumName) {
  const themes = {
    Midnights: "linear-gradient(135deg, #16213f, #6f76b8 54%, #c7a1ff)",
    Reputation: "linear-gradient(135deg, #151515, #5c6670 54%, #d9dad7)",
    "1989 TV": "linear-gradient(135deg, #75b9e8, #f4d27c 54%, #f5f2ec)",
    Lover: "linear-gradient(135deg, #f3a5c8, #9dc7ff 54%, #f5e38c)"
  };
  return themes[albumName] || "linear-gradient(135deg, var(--amber), var(--rose) 55%, var(--blue))";
}

function trackKey(track) {
  return track.source === "github" ? `${track.repo}/${track.path}` : `local/${track.title}`;
}

function playCountFor(track) {
  return playCounts[track.key] || 0;
}

function currentQueueTracks() {
  const currentTrack = tracks[currentIndex];
  if (!currentTrack) return [];
  if (shuffle && shuffleQueueIndices.length) {
    return shuffleQueueIndices
      .map((index) => ({ track: tracks[index], index }))
      .filter((item) => item.track);
  }
  return tracks
    .map((track, index) => ({ track, index }))
    .filter((item) => item.track.repo === currentTrack.repo);
}

function shuffledIndices(items) {
  const indices = items.map((item) => item.index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }
  return indices;
}

function buildAlbumShuffleQueue() {
  const baseQueue = shuffle && shuffleQueueIndices.length
    ? tracks
      .map((track, index) => ({ track, index }))
      .filter((item) => item.track.repo === tracks[currentIndex]?.repo)
    : currentQueueTracks();
  const albumItems = baseQueue.length
    ? baseQueue
    : tracks.map((track, index) => ({ track, index }));
  shuffleQueueIndices = shuffledIndices(albumItems);
  shuffleQueueMode = "album";
}

function playAlbum(album) {
  if (!album) return;
  if (shuffle) {
    shuffleQueueIndices = shuffledIndices(album.tracks);
    shuffleQueueMode = "album";
    renderPlaylist();
    loadTrack(shuffleQueueIndices[0]);
    return;
  }
  shuffleQueueIndices = [];
  shuffleQueueMode = "";
  loadTrack(album.firstIndex);
}

function recordPlay(track) {
  if (!track || countedTrackId === track.id) return;
  countedTrackId = track.id;
  playCounts[track.key] = playCountFor(track) + 1;
  savePlayCounts();
  renderHome();
}

function updateFavoriteButton() {
  const track = tracks[currentIndex];
  const active = isFavorite(track);
  favoriteBtn.classList.toggle("active", active);
  favoriteBtn.setAttribute("aria-label", active ? "Unfavorite" : "Favorite");
  favoriteBtn.setAttribute("title", active ? "Unfavorite" : "Favorite");
}

function fileExtension(fileName) {
  return fileName.split(".").pop().toLowerCase();
}

function isAudioFile(fileName) {
  return audioExtensions.has(fileExtension(fileName));
}

function isImageFile(fileName) {
  return imageExtensions.has(fileExtension(fileName));
}

function isPreferredCover(fileName) {
  return /(^|[ _.-])(cover|folder|front|album|artwork|art)([ _.-]|$)/i.test(cleanName(fileName));
}

function pickCoverImage(images) {
  if (!images.length) return "";
  const preferred = images.find((item) => isPreferredCover(item.name));
  return (preferred || images[0]).download_url || "";
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  return headers;
}

function addFiles(fileList) {
  const audioFiles = [...fileList].filter((file) => file.type.startsWith("audio/"));
  if (!audioFiles.length) return;

  const newTracks = audioFiles.map((file) => ({
    id: makeId(),
    source: "local",
    title: formatSongTitle(file.name),
    album: "Local files",
    key: `local/${file.name}-${file.size}`,
    file,
    url: URL.createObjectURL(file),
    size: formatBytes(file.size)
  }));

  tracks = [...tracks, ...newTracks];
  if (currentIndex === -1) loadTrack(0, false);
  renderPlaylist();
  renderHome();
}

async function loadTrack(index, autoplay = true) {
  if (!tracks[index]) return;
  currentIndex = index;
  countedTrackId = "";
  document.body.classList.add("has-track");
  const track = tracks[currentIndex];
  statusText.textContent = "Loading";
  let playableUrl;
  try {
    playableUrl = await getPlayableUrl(track);
  } catch (error) {
    statusText.textContent = error.message;
    return;
  }
  audio.crossOrigin = track.source === "github" && !githubToken ? "anonymous" : "";
  audio.src = playableUrl;
  audio.load();
  trackTitle.textContent = track.title;
  trackMeta.textContent = track.source === "github"
    ? track.album
    : `${track.file.type || "Audio"} - ${track.size}`;
  statusText.textContent = autoplay ? "Now playing" : "Ready";
  installMediaActionHandlers();
  setMediaMetadata(track);
  setMediaPlaybackState();
  updateFavoriteButton();
  renderPlaylist();
  renderHome();

  if (autoplay) {
    playAudio();
  }
}

async function restoreLastPlayedTrack() {
  const lastPlayed = readLastPlayed();
  if (!lastPlayed) {
    if (currentIndex === -1 && tracks.length) loadTrack(0, false);
    return;
  }

  const index = tracks.findIndex((track) => track.key === lastPlayed.key);
  if (index === -1) {
    if (currentIndex === -1 && tracks.length) loadTrack(0, false);
    return;
  }

  pendingSeekTime = Number(lastPlayed.time) || 0;
  await loadTrack(index, false);
  statusText.textContent = "Ready where you left off";
}

async function getPlayableUrl(track) {
  if (track.source !== "github" || !githubToken) return track.url;
  if (track.objectUrl) return track.objectUrl;

  const response = await fetch(track.gitUrl, { headers: githubHeaders() });
  if (!response.ok) {
    throw new Error(`Could not download ${track.path}`);
  }
  const data = await response.json();
  const binary = atob(data.content.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], { type: `audio/${fileExtension(track.path)}` });
  track.objectUrl = URL.createObjectURL(blob);
  return track.objectUrl;
}

async function ensureAudioGraph() {
  if (audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextClass();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  frequencyData = new Uint8Array(analyser.frequencyBinCount);
}

async function playAudio() {
  if (currentIndex === -1 && tracks.length) loadTrack(0, false);
  if (currentIndex === -1) return;
  await ensureAudioGraph();
  if (audioContext.state === "suspended") await audioContext.resume();
  await audio.play();
}

function pauseAudio() {
  audio.pause();
}

function setPlayState() {
  const playing = !audio.paused;
  playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  playBtn.setAttribute("title", playing ? "Pause" : "Play");
  playIcon.innerHTML = playing
    ? '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>'
    : '<path d="m8 5 11 7-11 7V5Z"/>';
  disc.classList.toggle("playing", playing);
  statusText.textContent = currentIndex === -1 ? "Choose audio files to begin" : playing ? "Now playing" : "Paused";
  document.body.classList.toggle("is-playing", playing);
  document.body.classList.toggle("has-track", currentIndex !== -1);
  setMediaPlaybackState();
  setMediaPositionState();
}

function nextTrack() {
  if (!tracks.length) return;
  const queueItems = currentQueueTracks();
  const queue = queueItems.length ? queueItems : tracks.map((track, index) => ({ track, index }));
  const queuePosition = Math.max(0, queue.findIndex((item) => item.index === currentIndex));
  loadTrack(queue[(queuePosition + 1) % queue.length].index);
}

function previousTrack() {
  if (!tracks.length) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const queueItems = currentQueueTracks();
  const queue = queueItems.length ? queueItems : tracks.map((track, index) => ({ track, index }));
  const queuePosition = Math.max(0, queue.findIndex((item) => item.index === currentIndex));
  loadTrack(queue[(queuePosition - 1 + queue.length) % queue.length].index);
}

function removeTrack(id) {
  const index = tracks.findIndex((track) => track.id === id);
  if (index === -1) return;
  const [removed] = tracks.splice(index, 1);
  shuffleQueueIndices = shuffleQueueIndices
    .filter((trackIndex) => trackIndex !== index)
    .map((trackIndex) => (trackIndex > index ? trackIndex - 1 : trackIndex));
  if (removed.source === "local") URL.revokeObjectURL(removed.url);
  if (removed.objectUrl) URL.revokeObjectURL(removed.objectUrl);

  if (!tracks.length) {
    currentIndex = -1;
    audio.removeAttribute("src");
    audio.load();
    trackTitle.textContent = "No track loaded";
    trackMeta.textContent = "MP3, WAV, OGG, M4A and other browser-supported audio files";
    statusText.textContent = "Choose audio files to begin";
  } else if (index === currentIndex) {
    loadTrack(Math.min(index, tracks.length - 1), !audio.paused);
  } else if (index < currentIndex) {
    currentIndex -= 1;
  }
  renderPlaylist();
  renderHome();
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  const queueItems = currentQueueTracks();

  queueItems.forEach(({ track, index }, queueIndex) => {
    const li = document.createElement("li");
    li.className = `track${index === currentIndex ? " active" : ""}`;

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.setAttribute("aria-label", `Play ${track.title}`);
    selectButton.addEventListener("click", () => loadTrack(index));

    const number = document.createElement("span");
    number.className = "track-index";
    number.textContent = queueIndex + 1;

    const copy = document.createElement("span");
    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = track.title;
    const meta = document.createElement("small");
    meta.textContent = track.source === "github" ? track.album : track.size;
    copy.append(title, meta);
    selectButton.append(number, copy);

    const fav = document.createElement("button");
    fav.className = `fav${isFavorite(track) ? " active" : ""}`;
    fav.type = "button";
    fav.setAttribute("aria-label", isFavorite(track) ? `Unfavorite ${track.title}` : `Favorite ${track.title}`);
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track);
    });

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", `Remove ${track.title}`);
    remove.addEventListener("click", () => removeTrack(track.id));

    li.append(selectButton, fav, remove);
    playlistEl.append(li);
  });

  emptyState.classList.toggle("hidden", queueItems.length > 0);
  trackCount.textContent = `${queueItems.length} ${queueItems.length === 1 ? "track" : "tracks"}`;
}

function groupedAlbums() {
  return tracks.reduce((albums, track, index) => {
    const albumName = track.album || "Taylor Albums";
    if (!albums.has(albumName)) {
      albums.set(albumName, {
        name: albumName,
        tracks: [],
        firstIndex: index,
        coverUrl: track.coverUrl || ""
      });
    }
    if (!albums.get(albumName).coverUrl && track.coverUrl) albums.get(albumName).coverUrl = track.coverUrl;
    albums.get(albumName).tracks.push({ track, index });
    return albums;
  }, new Map());
}

function renderHome() {
  const albums = [...groupedAlbums().values()];
  albumGrid.innerHTML = "";
  songGrid.innerHTML = "";

  if (!tracks.length) {
    albumGrid.innerHTML = '<div class="home-empty">Albums will appear here once the GitHub library loads.</div>';
    songGrid.innerHTML = '<div class="home-empty">Songs will appear here once the GitHub library loads.</div>';
  }

  albums.forEach((album, albumIndex) => {
    const button = document.createElement("button");
    button.className = `album-card${album.name === selectedAlbumName ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Open album ${album.name}`);
    button.addEventListener("click", () => openAlbum(album.name));

    const art = document.createElement("span");
    art.className = "album-art";
    if (album.coverUrl) {
      art.classList.add("has-cover");
      const image = document.createElement("img");
      image.src = album.coverUrl;
      image.alt = "";
      image.loading = "lazy";
      art.append(image);
    } else {
      art.style.background = albumTheme(album.name);
    }

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = album.name;
    const count = document.createElement("span");
    count.textContent = `${album.tracks.length} ${album.tracks.length === 1 ? "song" : "songs"}`;
    copy.append(title, count);
    button.append(art, copy);
    albumGrid.append(button);
  });

  const mostPlayedTracks = tracks
    .map((track, index) => ({ track, index, plays: playCountFor(track) }))
    .filter((item) => item.plays > 0)
    .sort((a, b) => b.plays - a.plays || a.track.title.localeCompare(b.track.title))
    .slice(0, mostPlayedLimit);

  mostPlayedTracks.forEach(({ track, index, plays }, rank) => {
    const button = document.createElement("button");
    button.className = `song-row${index === currentIndex ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Play ${track.title}`);
    button.addEventListener("click", () => loadTrack(index));

    const number = document.createElement("span");
    number.className = "song-number";
    number.textContent = rank + 1;

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    meta.textContent = `${plays} ${plays === 1 ? "play" : "plays"} - ${track.album || track.repo || track.size}`;
    copy.append(title, meta);

    const fav = document.createElement("button");
    fav.className = `fav${isFavorite(track) ? " active" : ""}`;
    fav.type = "button";
    fav.setAttribute("aria-label", isFavorite(track) ? `Unfavorite ${track.title}` : `Favorite ${track.title}`);
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track);
    });

    button.append(number, copy, fav);
    songGrid.append(button);
  });

  if (tracks.length && !mostPlayedTracks.length) {
    songGrid.innerHTML = '<div class="home-empty">Play a few songs and your most played tracks will appear here.</div>';
  }

  const favoriteTracks = tracks
    .map((track, index) => ({ track, index }))
    .filter((item) => isFavorite(item.track));

  favoritesMeta.textContent = `${favoriteTracks.length} ${favoriteTracks.length === 1 ? "favorite" : "favorites"}`;
  favoritesPreview.innerHTML = "";
  favoriteTracks
    .slice(0, 3)
    .forEach(({ track }) => {
      const chip = document.createElement("span");
      chip.className = "favorites-chip";
      chip.textContent = track.title;
      favoritesPreview.append(chip);
    });
  if (!favoriteTracks.length) {
    const chip = document.createElement("span");
    chip.className = "favorites-chip muted";
    chip.textContent = "No favorites yet";
    favoritesPreview.append(chip);
  }

  albumCount.textContent = `${albums.length} ${albums.length === 1 ? "album" : "albums"}`;
  const totalPlays = tracks.reduce((total, track) => total + playCountFor(track), 0);
  songCount.textContent = `${totalPlays} ${totalPlays === 1 ? "play" : "plays"}`;
  sidebarLibraryCount.textContent = `${albums.length} albums, ${tracks.length} songs`;
  renderAlbumDetail(albums);
  renderFavoritesDetail();
  if (!tracks.length) {
    libraryStatus.textContent = "Loading songs from GitHub...";
  } else {
    libraryStatus.textContent = "Choose an album or song to start listening.";
  }
}

function openAlbum(albumName) {
  if (selectedAlbumName === albumName) {
    selectedAlbumName = "";
    favoritesOpen = false;
    renderHome();
    return;
  }
  selectedAlbumName = albumName;
  favoritesOpen = false;
  renderHome();
  albumDetail.hidden = false;
  albumDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openFavorites() {
  if (favoritesOpen) {
    favoritesOpen = false;
    renderHome();
    return;
  }
  favoritesOpen = true;
  selectedAlbumName = "";
  renderHome();
  favoritesDetail.hidden = false;
  favoritesDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderAlbumDetail(albums = [...groupedAlbums().values()]) {
  const album = albums.find((item) => item.name === selectedAlbumName);
  albumDetail.hidden = !album;
  albumSongList.innerHTML = "";
  if (!album) return;

  albumDetailTitle.textContent = album.name;
  albumDetailMeta.textContent = `${album.tracks.length} ${album.tracks.length === 1 ? "song" : "songs"}`;
  playAlbumBtn.onclick = () => playAlbum(album);

  album.tracks.forEach(({ track, index }, albumIndex) => {
    const button = document.createElement("button");
    button.className = `album-song-row${index === currentIndex ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Play ${track.title}`);
    button.addEventListener("click", () => loadTrack(index));

    const number = document.createElement("span");
    number.className = "song-number";
    number.textContent = albumIndex + 1;

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    const plays = playCountFor(track);
    meta.textContent = `${plays} ${plays === 1 ? "play" : "plays"} - ${track.size}`;
    copy.append(title, meta);
    const fav = document.createElement("button");
    fav.className = `fav${isFavorite(track) ? " active" : ""}`;
    fav.type = "button";
    fav.setAttribute("aria-label", isFavorite(track) ? `Unfavorite ${track.title}` : `Favorite ${track.title}`);
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track);
    });

    button.append(number, copy, fav);
    albumSongList.append(button);
  });
}

function renderFavoritesDetail() {
  favoritesDetail.hidden = !favoritesOpen;
  favoritesSongList.innerHTML = "";
  if (!favoritesOpen) return;

  const favoriteTracks = tracks
    .map((track, index) => ({ track, index }))
    .filter((item) => isFavorite(item.track))
    .sort((a, b) => (a.track.album || "").localeCompare(b.track.album || "") || a.track.title.localeCompare(b.track.title));

  favoritesDetailMeta.textContent = `${favoriteTracks.length} ${favoriteTracks.length === 1 ? "song" : "songs"}`;

  if (!favoriteTracks.length) {
    favoritesSongList.innerHTML = '<div class="home-empty">No favorites yet. Tap the heart on a song to save it.</div>';
    return;
  }

  favoriteTracks.forEach(({ track, index }, favoriteIndex) => {
    const button = document.createElement("button");
    button.className = `album-song-row${index === currentIndex ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Play ${track.title}`);
    button.addEventListener("click", () => loadTrack(index));

    const number = document.createElement("span");
    number.className = "song-number";
    number.textContent = favoriteIndex + 1;

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    meta.textContent = track.album || track.size;
    copy.append(title, meta);

    const fav = document.createElement("button");
    fav.className = "fav active";
    fav.type = "button";
    fav.setAttribute("aria-label", `Remove ${track.title} from favorites`);
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track);
    });

    button.append(number, copy, fav);
    favoritesSongList.append(button);
  });
}

async function collectGithubAudio(owner, repo, branch, path) {
  const encodedPath = path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`);
  if (branch) url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    if (response.status === 404) throw new Error("Repository or folder was not found.");
    if (response.status === 401 || response.status === 403) throw new Error("GitHub refused access. Check the repo and token.");
    throw new Error("GitHub could not load that folder.");
  }

  const contents = await response.json();
  const items = Array.isArray(contents) ? contents : [contents];
  const audioItems = [];

  for (const item of items) {
    if (item.type === "dir") {
      const nestedPath = item.path;
      const nested = await collectGithubAudio(owner, repo, branch, nestedPath);
      audioItems.push(...nested);
    } else if (item.type === "file" && isAudioFile(item.name) && item.download_url) {
      audioItems.push(item);
    }
  }

  return audioItems;
}

async function collectGithubMedia(owner, repo, branch, path) {
  const encodedPath = path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`);
  if (branch) url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    if (response.status === 404) throw new Error("Repository or folder was not found.");
    if (response.status === 401 || response.status === 403) throw new Error("GitHub refused access. Check the repo and token.");
    throw new Error("GitHub could not load that folder.");
  }

  const contents = await response.json();
  const items = Array.isArray(contents) ? contents : [contents];
  const audioItems = [];
  const imageItems = [];

  for (const item of items) {
    if (item.type === "dir") {
      const nested = await collectGithubMedia(owner, repo, branch, item.path);
      audioItems.push(...nested.audioItems);
      imageItems.push(...nested.imageItems);
    } else if (item.type === "file" && item.download_url) {
      if (isAudioFile(item.name)) audioItems.push(item);
      if (isImageFile(item.name)) imageItems.push(item);
    }
  }

  return { audioItems, imageItems };
}

async function loadGithubRepository(event) {
  event?.preventDefault();
  const repoValue = repoInput.value.trim().replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  const [owner, repo] = repoValue.split("/");
  const branch = branchInput.value.trim();
  const path = pathInput.value.trim();
  githubToken = tokenInput.value.trim();

  await loadGithubAlbumSource({
    repo: `${owner || ""}/${repo || ""}`,
    branch,
    path,
    album: repo ? cleanPathName(repo.replace(/^ts_/, "").replace(/_player$/, "")) : ""
  });
}

async function loadGithubAlbumSource(sourceConfig) {
  const repoValue = sourceConfig.repo.trim().replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  const [owner, repo] = repoValue.split("/");
  const branch = sourceConfig.branch || "";
  const path = sourceConfig.path || "";
  const albumName = sourceConfig.album || cleanPathName(repo || "");

  if (!owner || !repo) {
    githubStatus.textContent = "Enter a repository like owner/repo.";
    return 0;
  }

  githubLoadBtn.disabled = true;
  githubStatus.textContent = `Looking through ${albumName}...`;

  try {
    const { audioItems, imageItems } = await collectGithubMedia(owner, repo, branch, path);
    if (!audioItems.length) {
      githubStatus.textContent = "No audio files found in that folder.";
      return 0;
    }

    const repoName = `${owner}/${repo}`;
    const coverUrl = pickCoverImage(imageItems);
    const newTracks = audioItems.map((item) => ({
      id: makeId(),
      source: "github",
      title: formatSongTitle(item.name),
      album: albumName,
      coverUrl,
      key: `${repoName}/${item.path}`,
      url: item.download_url,
      gitUrl: item.git_url,
      repo: repoName,
      path: item.path,
      size: formatBytes(item.size)
    }));

    tracks = [...tracks, ...newTracks];
    if (currentIndex === -1 && !sourceConfig.deferInitialLoad) loadTrack(0, false);
    renderPlaylist();
    renderHome();
    githubStatus.textContent = `Added ${audioItems.length} ${audioItems.length === 1 ? "track" : "tracks"} from ${repoName}.`;
    return audioItems.length;
  } catch (error) {
    githubStatus.textContent = error.message;
    throw error;
  } finally {
    githubLoadBtn.disabled = false;
  }
}

async function loadDefaultGithubAlbums() {
  repoInput.value = defaultGithubAlbums[0].repo;
  branchInput.value = "";
  pathInput.value = "";
  githubToken = tokenInput.value.trim();
  githubLoadBtn.disabled = true;
  githubStatus.textContent = "Loading albums automatically...";
  libraryStatus.textContent = "Loading albums from GitHub...";

  let loadedCount = 0;
  const failures = [];
  for (const sourceConfig of defaultGithubAlbums) {
    try {
      loadedCount += await loadGithubAlbumSource({ ...sourceConfig, deferInitialLoad: true });
    } catch (error) {
      failures.push(`${sourceConfig.album}: ${error.message}`);
    }
  }

  githubLoadBtn.disabled = false;
  if (loadedCount) {
    await restoreLastPlayedTrack();
    libraryStatus.textContent = `Loaded ${loadedCount} ${loadedCount === 1 ? "song" : "songs"} across ${defaultGithubAlbums.length} albums.`;
    githubStatus.textContent = failures.length ? failures.join(" | ") : "Albums loaded.";
  } else {
    libraryStatus.textContent = failures.length ? failures.join(" | ") : "No audio files found in the GitHub albums.";
    githubStatus.textContent = libraryStatus.textContent;
  }
}

function shuffleAllAlbums() {
  if (!tracks.length) return;
  shuffle = true;
  shuffleQueueIndices = shuffledIndices(tracks.map((track, index) => ({ track, index })));
  shuffleQueueMode = "all";
  shuffleBtn.classList.add("active");
  renderPlaylist();
  loadTrack(shuffleQueueIndices[0]);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function collapseMobilePlayer() {
  if (isMobileViewport()) document.body.classList.add("player-collapsed");
}

function expandMobilePlayer() {
  if (isMobileViewport()) document.body.classList.remove("player-collapsed");
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const bars = frequencyData?.length || 48;
  if (analyser && frequencyData && !audio.paused) {
    analyser.getByteFrequencyData(frequencyData);
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = width * 0.27;

  for (let i = 0; i < bars; i += 1) {
    const level = frequencyData ? frequencyData[i] / 255 : 0.12 + Math.sin(Date.now() / 500 + i) * 0.04;
    const angle = (i / bars) * Math.PI * 2;
    const barLength = 28 + level * 96;
    const x1 = centerX + Math.cos(angle) * baseRadius;
    const y1 = centerY + Math.sin(angle) * baseRadius;
    const x2 = centerX + Math.cos(angle) * (baseRadius + barLength);
    const y2 = centerY + Math.sin(angle) * (baseRadius + barLength);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = i % 3 === 0 ? "#e7b75f" : i % 3 === 1 ? "#68c8ac" : "#db7d85";
    ctx.globalAlpha = 0.38 + level * 0.55;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

fileInput.addEventListener("change", (event) => addFiles(event.target.files));

playBtn.addEventListener("click", () => {
  if (audio.paused) playAudio();
  else pauseAudio();
});

prevBtn.addEventListener("click", previousTrack);
nextBtn.addEventListener("click", nextTrack);
shuffleAllBtn.addEventListener("click", shuffleAllAlbums);
favoritesCard.addEventListener("click", openFavorites);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  if (shuffle) {
    buildAlbumShuffleQueue();
  } else {
    shuffleQueueIndices = [];
    shuffleQueueMode = "";
  }
  shuffleBtn.classList.toggle("active", shuffle);
  renderPlaylist();
});

favoriteBtn.addEventListener("click", () => toggleFavorite(tracks[currentIndex]));

repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.classList.toggle("active", audio.muted);
});

playerEl.addEventListener("touchstart", (event) => {
  swipeStartY = event.touches[0].clientY;
  expandMobilePlayer();
}, { passive: true });

playerEl.addEventListener("touchend", (event) => {
  const endY = event.changedTouches[0].clientY;
  if (swipeStartY - endY > 55 && window.matchMedia("(max-width: 900px)").matches) {
    document.body.classList.add("queue-open");
  }
}, { passive: true });

queueEl.addEventListener("touchstart", (event) => {
  swipeStartY = event.touches[0].clientY;
}, { passive: true });

queueEl.addEventListener("touchend", (event) => {
  const endY = event.changedTouches[0].clientY;
  if (endY - swipeStartY > 55 && window.matchMedia("(max-width: 900px)").matches) {
    document.body.classList.remove("queue-open");
  }
}, { passive: true });

document.addEventListener("click", (event) => {
  if (!isMobileViewport()) return;
  if (!playerEl.contains(event.target) && !queueEl.contains(event.target)) {
    collapseMobilePlayer();
    document.body.classList.remove("queue-open");
  }
});

window.addEventListener("scroll", () => {
  if (!isMobileViewport()) return;
  if (window.scrollY <= 4) {
    expandMobilePlayer();
  } else if (Math.abs(window.scrollY - lastScrollY) > 8) {
    collapseMobilePlayer();
  }
  lastScrollY = window.scrollY;
}, { passive: true });

clearBtn.addEventListener("click", () => {
  tracks.forEach((track) => {
    if (track.source === "local") URL.revokeObjectURL(track.url);
    if (track.objectUrl) URL.revokeObjectURL(track.objectUrl);
  });
  tracks = [];
  shuffleQueueIndices = [];
  shuffleQueueMode = "";
  currentIndex = -1;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  seek.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  setPlayState();
  renderPlaylist();
  renderHome();
  trackTitle.textContent = "No track loaded";
  trackMeta.textContent = "MP3, WAV, OGG, M4A and other browser-supported audio files";
});

githubForm.addEventListener("submit", loadGithubRepository);

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  audio.muted = audio.volume === 0;
  muteBtn.classList.toggle("active", audio.muted);
});

seek.addEventListener("input", () => {
  isSeeking = true;
  const time = (Number(seek.value) / 1000) * (audio.duration || 0);
  currentTimeEl.textContent = formatTime(time);
});

seek.addEventListener("change", () => {
  audio.currentTime = (Number(seek.value) / 1000) * (audio.duration || 0);
  isSeeking = false;
  setMediaPositionState();
});

audio.addEventListener("play", setPlayState);
audio.addEventListener("playing", () => recordPlay(tracks[currentIndex]));
audio.addEventListener("pause", setPlayState);
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
  if (pendingSeekTime) {
    audio.currentTime = Math.min(pendingSeekTime, audio.duration || pendingSeekTime);
    pendingSeekTime = 0;
  }
  setMediaPositionState();
  setMediaPlaybackState();
  saveLastPlayed();
});

audio.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    seek.value = audio.duration ? String((audio.currentTime / audio.duration) * 1000) : "0";
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
  const now = Date.now();
  if (now - lastMediaPositionUpdate > 750) {
    lastMediaPositionUpdate = now;
    setMediaPositionState();
  }
  saveLastPlayed();
});

audio.addEventListener("ratechange", () => setMediaPositionState());
audio.addEventListener("seeked", () => setMediaPositionState());
audio.addEventListener("durationchange", () => setMediaPositionState());

audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, button")) return;
  if (event.code === "Space") {
    event.preventDefault();
    audio.paused ? playAudio() : pauseAudio();
  }
  if (event.code === "ArrowRight") audio.currentTime = Math.min((audio.currentTime || 0) + 5, audio.duration || 0);
  if (event.code === "ArrowLeft") audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
});

["dragenter", "dragover"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    document.body.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    document.body.classList.remove("dragging");
  });
});

document.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));

installMediaActionHandlers();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

renderPlaylist();
renderHome();
drawVisualizer();
loadDefaultGithubAlbums();
