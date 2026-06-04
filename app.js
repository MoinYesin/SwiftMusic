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
const favoritesDetail = document.querySelector("#favoritesDetail");
const favoritesDetailMeta = document.querySelector("#favoritesDetailMeta");
const favoritesDetailArt = document.querySelector("#favoritesDetailArt");
const favoritesDetailDescription = document.querySelector("#favoritesDetailDescription");
const favoritesSongList = document.querySelector("#favoritesSongList");
const closeFavoritesDetailBtn = document.querySelector("#closeFavoritesDetailBtn");
const songGrid = document.querySelector("#songGrid");
const songsHeading = document.querySelector("#songsHeading");
const searchInput = document.querySelector("#searchInput");
const searchPanel = document.querySelector("#searchPanel");
const albumDetail = document.querySelector("#albumDetail");
const albumDetailTitle = document.querySelector("#albumDetailTitle");
const albumDetailMeta = document.querySelector("#albumDetailMeta");
const albumDetailArt = document.querySelector("#albumDetailArt");
const albumDetailDescription = document.querySelector("#albumDetailDescription");
const albumSongList = document.querySelector("#albumSongList");
const closeAlbumDetailBtn = document.querySelector("#closeAlbumDetailBtn");
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
const lyricsBtn = document.querySelector("#lyricsBtn");
const muteBtn = document.querySelector("#muteBtn");
const playerEl = document.querySelector(".player");
const queueEl = document.querySelector(".queue");
const nowPlayingEl = document.querySelector(".now-playing");
const titleActions = document.querySelector("#titleActions");
const playerRightActions = document.querySelector("#playerRightActions");
const queueToggleBtn = document.querySelector("#queueToggleBtn");
const lyricsPanel = document.querySelector("#lyricsPanel");
const closeLyricsBtn = document.querySelector("#closeLyricsBtn");
const lyricsPanelTitle = document.querySelector("#lyricsPanelTitle");
const lyricsPanelMeta = document.querySelector("#lyricsPanelMeta");
const lyricsStatus = document.querySelector("#lyricsStatus");
const lyricsText = document.querySelector("#lyricsText");
const playerMinimizeBtn = document.querySelector("#playerMinimizeBtn");
const playerFullActions = document.querySelector("#playerFullActions");
const fullActionsRow = document.querySelector("#fullActionsRow");
const fullActionsLeft = document.querySelector("#fullActionsLeft");
const fullActionsRight = document.querySelector("#fullActionsRight");
const githubForm = document.querySelector("#githubForm");
const repoInput = document.querySelector("#repoInput");
const branchInput = document.querySelector("#branchInput");
const pathInput = document.querySelector("#pathInput");
const tokenInput = document.querySelector("#tokenInput");
const githubLoadBtn = document.querySelector("#githubLoadBtn");
const githubStatus = document.querySelector("#githubStatus");
const coverArt = document.querySelector("#coverArt");

/* =============================================
   TOAST & CONFIRM SYSTEM
   ============================================= */
function showToast(message, type = "info", duration = 3000) {
  const container = document.querySelector("#toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const dot = document.createElement("span");
  dot.className = "toast-dot";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(dot, text);
  container.append(toast);
  const dismiss = () => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };
  const timer = setTimeout(dismiss, duration);
  toast.addEventListener("click", () => { clearTimeout(timer); dismiss(); });
}

function showConfirm(message, title = "Are you sure?") {
  return new Promise((resolve) => {
    const modal = document.querySelector("#confirmModal");
    const titleEl = document.querySelector("#confirmTitle");
    const messageEl = document.querySelector("#confirmMessage");
    const okBtn = document.querySelector("#confirmOkBtn");
    const cancelBtn = document.querySelector("#confirmCancelBtn");
    if (!modal || !okBtn || !cancelBtn) { resolve(window.confirm(message)); return; }
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    modal.hidden = false;
    document.body.classList.add("picker-open");
    const cleanup = (result) => {
      modal.hidden = true;
      document.body.classList.remove("picker-open");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    okBtn.addEventListener("click", onOk, { once: true });
    cancelBtn.addEventListener("click", onCancel, { once: true });
    cancelBtn.focus();
  });
}

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
const githubCacheKey = "swiftMusicGithubCacheV1";
const githubCacheMaxAgeMs = 1000 * 60 * 60 * 24 * 14; 
const mostPlayedLimit = 10;
const lyricsCacheKey = "swiftMusicLyricsCacheV1";

const customPlaylistsKey = "taylorCustomPlaylistsV1";

const albumNotes = {
  "Midnights": "Released in 2022, Midnights is a concept album inspired by '13 sleepless nights' scattered throughout Taylor Swift's life. Stylistically, it blends dream pop, synthpop, and electropop with introspective, raw lyrics. The album features massive hits like 'Anti-Hero' and explores themes of self-reflection, love, and anxiety, earning multiple Grammy Awards including Album of the Year.",
  "Reputation": "Released in 2017, Reputation is a bold, electropop and industrial-pop departure that addresses media scrutiny, public perception, and finding love amidst chaos. Known for its dark, bass-heavy production and snake imagery, the album features standout tracks like 'Delicate' and 'Look What You Made Me Do', contrasting themes of anger and defense with soft, private vulnerability.",
  "1989 TV": "Released in 2023, 1989 (Taylor's Version) is the fully re-recorded edition of Swift's landmark 2014 synth-pop crossover. Paying homage to 1980s pop, it features soaring synthesizers and drums on hits like 'Blank Space' and 'Style', alongside 5 unreleased 'From The Vault' tracks. The album represents a major sonic reinvention and a celebrated reclaim of her artistic catalog.",
  "Lover": "Released in 2019, Lover is a vibrant, colorful celebration of love in all its forms—romantic, familial, and self-love. Sonically, it spans dream pop, upbeat bubblegum pop, and acoustic ballads. Featuring tracks like 'Cruel Summer' and the title track 'Lover', it stands as a warm, bright, and emotionally diverse record following the darker era of Reputation."
};

let tracks = [];
let currentIndex = -1;
let isSeeking = false;
let shuffle = false;
let repeat = "off";
let audioContext;
let source;
let analyser;
let visualizerAnimationId = null;
let isMediaElementConnected = false;
let githubToken = "";
let playCounts = readPlayCounts();
let countedTrackId = "";
let selectedAlbumName = "";
let pendingSeekTime = 0;
let shuffleQueueIndices = [];
let shuffleQueueMode = "";
let swipeStartY = 0;
let swipeStartX = 0;
let swipeTracking = false;
let lastScrollY = window.scrollY;
let favorites = readFavorites();
let favoritesOpen = false;
let lastOpenedPanel = "";
let lastMediaPositionUpdate = 0;
let queueContext = { mode: "repo", label: "", indices: [] };
let searchQuery = "";
let lyricsOpen = false;
let lyricsLoading = false;
let lyricsTrackKey = "";
let parsedLyrics = [];
let currentLyricIndex = -1;

let customPlaylists = readCustomPlaylists();
let selectedPlaylistName = "";
let activeTrackForPlaylistSelection = null; 
let dailyMixes = {};
let recommendedTracks = [];
let queueList = [];
let playbackHistory = [];

function readGithubCache() {
  try { return JSON.parse(localStorage.getItem(githubCacheKey)) || {}; } catch { return {}; }
}
function writeGithubCache(cache) {
  try { localStorage.setItem(githubCacheKey, JSON.stringify(cache)); } catch {}
}
function readLyricsCache() {
  try { return JSON.parse(localStorage.getItem(lyricsCacheKey)) || {}; } catch { return {}; }
}
function writeLyricsCache(cache) {
  try { localStorage.setItem(lyricsCacheKey, JSON.stringify(cache)); } catch {}
}
function readCustomPlaylists() {
  try { return JSON.parse(localStorage.getItem(customPlaylistsKey)) || {}; } catch { return {}; }
}
function saveCustomPlaylists() {
  localStorage.setItem(customPlaylistsKey, JSON.stringify(customPlaylists));
}


function setQueueContextRepo(label = "") {
  queueContext = { mode: "repo", label, indices: [] };
}

function setDetailWindowState() {
  const detailOpen = Boolean(selectedAlbumName || favoritesOpen || selectedPlaylistName);
  document.body.classList.toggle("detail-open", detailOpen);
  document.body.classList.toggle("album-window-open", Boolean(selectedAlbumName));
  document.body.classList.toggle("favorites-window-open", favoritesOpen);

  if (detailOpen) { setQueueOpen(false); }

  positionFavoriteButton();
  positionMuteButton();
  positionQueueToggleButton();
  positionLyricsButton();
  updateLyricsButtonState();
}

function setQueueContextList(label, indices, currentTrackIndex) {
  const unique = [...new Set(indices)].filter((index) => Number.isInteger(index) && index >= 0 && index < tracks.length);
  queueContext = { mode: "list", label, indices: unique };
  if (shuffle) {
    const items = baseQueueItems({ ignoreShuffle: true });
    const shuffled = shuffledIndices(items);
    const startIndex = Number.isInteger(currentTrackIndex) ? currentTrackIndex : -1;
    if (startIndex >= 0) {
      const pos = shuffled.indexOf(startIndex);
      if (pos > 0) shuffleQueueIndices = [startIndex, ...shuffled.filter((id) => id !== startIndex)];
      else shuffleQueueIndices = shuffled;
    } else {
      shuffleQueueIndices = shuffled;
    }
    shuffleQueueMode = label || "list";
  }
}

function hasMediaSession() { return "mediaSession" in navigator; }

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
  } catch {}
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
    try { navigator.mediaSession.setActionHandler(action, handler); } catch {}
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

audio.volume = 1;

function makeId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function readPlayCounts() {
  try { return JSON.parse(localStorage.getItem(playCountsKey)) || {}; } catch { return {}; }
}
function savePlayCounts() { localStorage.setItem(playCountsKey, JSON.stringify(playCounts)); }
function readFavorites() {
  try { return JSON.parse(localStorage.getItem(favoritesKey)) || {}; } catch { return {}; }
}
function saveFavorites() { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); }
function isFavorite(track) { return track ? Boolean(favorites[track.key]) : false; }

function toggleFavorite(track) {
  if (!track) return;
  if (isFavorite(track)) delete favorites[track.key];
  else favorites[track.key] = true;
  saveFavorites();
  updateFavoriteButton();
  renderHome();
  renderPlaylist();
}

let activeDropdownTrack = null;
let activeDropdownContext = "";

function openTrackDropdown(track, buttonEl, context) {
  const dropdown = document.querySelector("#trackDropdown");
  if (!dropdown) return;

  if (!dropdown.hidden && activeDropdownTrack?.key === track.key) {
    closeTrackDropdown();
    return;
  }

  activeDropdownTrack = track;
  activeDropdownContext = context;

  const playNextOpt = document.querySelector("#trackPlayNextOption");
  const addOpt = document.querySelector("#trackAddOption");
  const favOpt = document.querySelector("#trackFavOption");
  const removeOpt = document.querySelector("#trackRemoveOption");

  if (playNextOpt) {
    playNextOpt.onclick = (e) => {
      e.stopPropagation();
      closeTrackDropdown();
      addTrackToQueue(track);
    };
  }

  if (addOpt) {
    addOpt.onclick = (e) => {
      e.stopPropagation();
      closeTrackDropdown();
      openPlaylistPicker(track);
    };
  }

  if (favOpt) {
    const fav = isFavorite(track);
    favOpt.textContent = fav ? "Unlike" : "Like";
    favOpt.onclick = (e) => {
      e.stopPropagation();
      closeTrackDropdown();
      toggleFavorite(track);
    };
  }

  if (removeOpt) {
    const isDailyMix = Boolean(dailyMixes[selectedPlaylistName]);
    if (context === "playlist" && !isDailyMix) {
      removeOpt.hidden = false;
      removeOpt.onclick = (e) => {
        e.stopPropagation();
        closeTrackDropdown();
        removeTrackFromPlaylist(track.key, selectedPlaylistName);
      };
    } else {
      removeOpt.hidden = true;
    }
  }

  dropdown.hidden = false;
  
  const rect = buttonEl.getBoundingClientRect();
  const dropdownWidth = dropdown.offsetWidth || 160;
  const dropdownHeight = dropdown.offsetHeight || 120;
  
  let left = rect.right - dropdownWidth;
  let top = rect.bottom + 6;
  
  if (left < 10) left = 10;
  if (top + dropdownHeight > window.innerHeight) {
    top = rect.top - dropdownHeight - 6;
  }

  dropdown.style.left = `${left}px`;
  dropdown.style.top = `${top}px`;
}

function closeTrackDropdown() {
  const dropdown = document.querySelector("#trackDropdown");
  if (dropdown) dropdown.hidden = true;
  activeDropdownTrack = null;
  activeDropdownContext = "";
}

function readLastPlayed() {
  try { return JSON.parse(localStorage.getItem(lastPlayedKey)) || null; } catch { return null; }
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

function updateSeekProgress() {
  if (!seek) return;
  const val = Number(seek.value) || 0;
  const max = Number(seek.max) || 1000;
  const percent = (val / max) * 100;
  seek.style.background = `linear-gradient(to right, var(--mint) 0%, var(--mint) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%, rgba(255, 255, 255, 0.1) 100%)`;
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

function playCountFor(track) { return playCounts[track.key] || 0; }
function normalizeSearchQuery(value) { return String(value || "").trim().toLowerCase(); }

function trackSearchText(track) {
  return [track.title, track.album, track.repo, track.size, track.path].filter(Boolean).join(" ").toLowerCase();
}

function trackTitleMatchesSearch(track, query) {
  if (!query) return false;
  return track.title.trim().toLowerCase() === query;
}

function albumMatchesSearch(album, query) {
  if (!query) return true;
  if (album.name.toLowerCase().includes(query)) return true;
  return album.tracks.some(({ track }) => trackSearchText(track).includes(query));
}

function lyricsLookupForTrack(track) {
  if (!track) return { artist: "", title: "" };
  const artist = track.artist || (track.source === "github" ? "Taylor Swift" : "");
  const title = track.title || "";
  return { artist: artist.trim(), title: title.trim() };
}

function albumDescription(albumName) {
  return albumNotes[albumName] || "A carefully grouped album view with its own artwork, quick summary, and the full song list below.";
}

function renderAlbumArtwork(target, album) {
  if (!target) return;
  target.innerHTML = "";
  if (album?.coverUrl) {
    target.style.background = "";
    target.classList.add("has-cover");
    const image = document.createElement("img");
    image.src = album.coverUrl;
    image.alt = `${album.name} cover art`;
    image.loading = "lazy";
    image.hidden = false;
    target.append(image);
    return;
  }
  target.classList.remove("has-cover");
  target.style.background = album ? albumTheme(album.name) : "";
}

function renderFavoritesArtwork(target, favoriteTracks) {
  if (!target) return;
  target.innerHTML = "";
  target.classList.remove("has-cover");
  target.style.background = "linear-gradient(135deg, rgba(222, 127, 139, 0.92), rgba(241, 191, 102, 0.95))";
  const icon = document.createElement("span");
  icon.className = "favorites-art-icon";
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
  target.append(icon);
}

function cleanLyricsTitle(title) {
  return String(title || "")
    .replace(/\s*\((feat\.|ft\.|with|from).*?\)\s*/gi, " ")
    .replace(/\s*\((Taylor's Version|TV|Remastered.*?|Live.*?|Version.*?|Explicit)\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function updateLyricsButtonState() {
  if (!lyricsBtn) return;
  const mobile = isMobileViewport();
  const collapsed = document.body.classList.contains("player-collapsed");
  const fullscreen = document.body.classList.contains("player-fullscreen");
  lyricsBtn.hidden = Boolean(mobile && !fullscreen);
  lyricsBtn.classList.toggle("active", lyricsOpen);
  lyricsBtn.setAttribute("aria-label", lyricsOpen ? "Hide lyrics" : "Show lyrics");
  lyricsBtn.setAttribute("title", lyricsOpen ? "Hide lyrics" : "Lyrics");
  if (!mobile) lyricsBtn.hidden = false;
  if (mobile && collapsed) lyricsBtn.hidden = true;
}

function positionLyricsButton() {
  if (!lyricsBtn) return;
  const controls = document.querySelector(".controls");
  if (!controls) return;
  if (isMobileViewport() && document.body.classList.contains("player-fullscreen")) {
    if (fullActionsRight && lyricsBtn.parentElement !== fullActionsRight) {
      fullActionsRight.appendChild(lyricsBtn);
    }
    return;
  }
  if (lyricsBtn.parentElement !== controls) {
    controls.appendChild(lyricsBtn);
  }
}

function getLyricsCacheEntry(track) {
  const cache = readLyricsCache();
  return cache[track.key] || null;
}

function saveLyricsCacheEntry(track, artist, title, plainLyrics, syncedLyrics = "") {
  const cache = readLyricsCache();
  cache[track.key] = {
    artist,
    title,
    plainLyrics,
    syncedLyrics,
    lyrics: syncedLyrics || plainLyrics,
    lyricsChecked: true,
    ts: Date.now()
  };
  writeLyricsCache(cache);
}

function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/;
  
  for (let line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msString = match[3] || "00";
      const milliseconds = parseInt(msString, 10);
      const msDivisor = msString.length === 3 ? 1000 : 100;
      const time = minutes * 60 + seconds + milliseconds / msDivisor;
      const text = line.replace(timeRegex, '').trim();
      result.push({ time, text });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

async function fetchLyricsForTrack(track) {
  const { artist, title } = lyricsLookupForTrack(track);
  if (!artist) throw new Error("Lyrics are available for tracks with artist metadata.");
  const normalizedTitle = cleanLyricsTitle(title);

  // 1. Try direct fetch from LrcLib (free public database for synced lyrics)
  try {
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(normalizedTitle)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const synced = String(data?.syncedLyrics || "").trim();
      const plain = String(data?.plainLyrics || "").trim();
      if (synced || plain) {
        return { plainLyrics: plain, syncedLyrics: synced };
      }
    }
  } catch (e) {
    console.warn("Direct LrcLib fetch failed, trying search fallback...", e);
  }

  // 2. Search fallback on LrcLib (fuzzy search)
  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(artist + " " + normalizedTitle)}`;
    const response = await fetch(url);
    if (response.ok) {
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const match = results[0];
        const synced = String(match?.syncedLyrics || "").trim();
        const plain = String(match?.plainLyrics || "").trim();
        if (synced || plain) {
          return { plainLyrics: plain, syncedLyrics: synced };
        }
      }
    }
  } catch (e) {
    console.warn("LrcLib search failed...", e);
  }

  // 3. Last fallback to old lyrics.ovh API
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(normalizedTitle)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const plain = String(data?.lyrics || "").trim();
      if (plain) {
        return { plainLyrics: plain, syncedLyrics: "" };
      }
    }
  } catch (e) {
    console.warn("Lyrics.ovh fetch failed...", e);
  }

  throw new Error("Lyrics not found for this song.");
}


function renderLyricsPanelState(message = "") {
  if (!lyricsPanel || !lyricsStatus || !lyricsText || !lyricsPanelTitle || !lyricsPanelMeta) return;
  const track = tracks[currentIndex];
  if (!lyricsOpen) {
    lyricsStatus.textContent = "";
    lyricsText.textContent = "";
    parsedLyrics = [];
    currentLyricIndex = -1;
    return;
  }

  if (!track) {
    lyricsPanelTitle.textContent = "Lyrics";
    lyricsPanelMeta.textContent = "Choose a song";
    lyricsStatus.textContent = "Select a song to view lyrics.";
    lyricsText.textContent = "";
    parsedLyrics = [];
    currentLyricIndex = -1;
    return;
  }

  const { artist, title } = lyricsLookupForTrack(track);
  lyricsPanelTitle.textContent = title || "Lyrics";
  lyricsPanelMeta.textContent = [artist, track.album].filter(Boolean).join(" • ") || "Lyrics lookup";
  lyricsStatus.textContent = message || "";
}

function updateLyricsSync(force = false) {
  const ticker = document.querySelector("#lyricsTicker");
  const hasLyrics = parsedLyrics && parsedLyrics.length > 0;
  
  let activeIndex = -1;
  if (hasLyrics) {
    const currentTime = audio.currentTime;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Update Ticker display (only if in fullscreen player on mobile)
  if (ticker) {
    const currentLine = activeIndex >= 0 ? parsedLyrics[activeIndex].text : "";
    if (currentLine && isMobileViewport() && document.body.classList.contains("player-fullscreen")) {
      ticker.textContent = currentLine;
      ticker.hidden = false;
    } else {
      ticker.textContent = "";
      ticker.hidden = true;
    }
  }

  // If main lyrics panel is open, update line highlighting and scroll position
  if (lyricsOpen && hasLyrics && (activeIndex !== currentLyricIndex || force)) {
    currentLyricIndex = activeIndex;
    
    const lines = lyricsText.querySelectorAll(".lyric-line");
    lines.forEach((line, idx) => {
      if (idx === activeIndex) {
        line.classList.add("active");
        line.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        line.classList.remove("active");
      }
    });
  } else if (!lyricsOpen) {
    currentLyricIndex = activeIndex;
  }
}

async function preloadLyrics(track) {
  if (!track) return;
  if (lyricsTrackKey === track.key && parsedLyrics.length > 0) return;
  if (lyricsLoading) return;

  try {
    let data = null;
    const cached = getLyricsCacheEntry(track);
    if (cached && cached.syncedLyrics) {
      data = {
        syncedLyrics: cached.syncedLyrics,
        plainLyrics: cached.plainLyrics
      };
    } else {
      const fetched = await fetchLyricsForTrack(track);
      const synced = fetched.syncedLyrics || (fetched.lyrics && fetched.lyrics.includes("[00:") ? fetched.lyrics : "");
      const plain = fetched.plainLyrics || fetched.lyrics || "";
      data = { syncedLyrics: synced, plainLyrics: plain };
      
      const { artist, title } = lyricsLookupForTrack(track);
      if (synced) {
        saveLyricsCacheEntry(track, artist, title, plain, synced);
      }
    }

    const activeTrack = tracks[currentIndex];
    if (activeTrack && activeTrack.key === track.key) {
      lyricsTrackKey = track.key;
      if (data.syncedLyrics) {
        parsedLyrics = parseLRC(data.syncedLyrics);
      } else {
        parsedLyrics = [];
      }
      updateLyricsSync(true);
    }
  } catch (e) {
    console.warn("Background lyrics preload failed:", e);
  }
}

async function loadLyricsPanel() {
  const track = tracks[currentIndex];
  if (!track) {
    renderLyricsPanelState("Select a song to view lyrics.");
    return;
  }
  const { artist, title } = lyricsLookupForTrack(track);
  const lookupTitle = cleanLyricsTitle(title);

  // If lyrics are already preloaded for this track and parsedLyrics has content,
  // do not clear or reload them, just build the DOM if it's empty.
  if (lyricsTrackKey === track.key && parsedLyrics.length > 0) {
    if (lyricsText && lyricsText.childElementCount === 0) {
      lyricsText.innerHTML = "";
      parsedLyrics.forEach((line) => {
        const div = document.createElement("div");
        div.className = "lyric-line";
        div.textContent = line.text || "•••";
        div.addEventListener("click", () => {
          audio.currentTime = line.time;
          updateSeekProgress();
          updateLyricsSync(true);
        });
        lyricsText.append(div);
      });
    }
    if (lyricsPanelTitle) lyricsPanelTitle.textContent = lookupTitle || title || "Lyrics";
    if (lyricsPanelMeta) lyricsPanelMeta.textContent = [artist, track.album].filter(Boolean).join(" • ") || "Lyrics lookup";
    lyricsStatus.textContent = "";
    updateLyricsSync(true);
    return;
  }

  lyricsTrackKey = track.key;
  lyricsLoading = true;
  renderLyricsPanelState("Loading lyrics...");
  if (lyricsText) lyricsText.textContent = "";
  parsedLyrics = [];
  currentLyricIndex = -1;

  try {
    let data = null;
    const cached = getLyricsCacheEntry(track);
    if (cached && cached.syncedLyrics) {
      data = {
        syncedLyrics: cached.syncedLyrics,
        plainLyrics: cached.plainLyrics
      };
    } else {
      const fetched = await fetchLyricsForTrack(track);
      const synced = fetched.syncedLyrics || (fetched.lyrics && fetched.lyrics.includes("[00:") ? fetched.lyrics : "");
      const plain = fetched.plainLyrics || fetched.lyrics || "";
      data = { syncedLyrics: synced, plainLyrics: plain };
      
      if (synced) {
        saveLyricsCacheEntry(track, artist, title, plain, synced);
      }
    }

    if (!lyricsOpen || lyricsTrackKey !== track.key) return;
    if (lyricsPanelTitle) lyricsPanelTitle.textContent = lookupTitle || title || "Lyrics";
    if (lyricsPanelMeta) lyricsPanelMeta.textContent = [artist, track.album].filter(Boolean).join(" • ") || "Lyrics lookup";
    lyricsStatus.textContent = "";
    
    const syncedLyrics = data.syncedLyrics;
    const plainLyrics = data.plainLyrics;

    if (syncedLyrics) {
      parsedLyrics = parseLRC(syncedLyrics);
      lyricsText.innerHTML = "";
      
      parsedLyrics.forEach((line) => {
        const div = document.createElement("div");
        div.className = "lyric-line";
        div.textContent = line.text || "•••";
        div.addEventListener("click", () => {
          audio.currentTime = line.time;
          updateSeekProgress();
          updateLyricsSync(true);
        });
        lyricsText.append(div);
      });
      
      updateLyricsSync(true);
    } else if (plainLyrics) {
      parsedLyrics = [];
      lyricsText.innerHTML = "";
      const lines = plainLyrics.split('\n');
      lines.forEach((lineText) => {
        const div = document.createElement("div");
        div.className = "lyric-line plain";
        div.textContent = lineText.trim();
        div.style.opacity = "1";
        div.style.transform = "none";
        div.style.cursor = "default";
        lyricsText.append(div);
      });
    } else {
      throw new Error("Lyrics content is empty.");
    }
  } catch (error) {
    if (!lyricsOpen || lyricsTrackKey !== track.key) return;
    lyricsStatus.textContent = error.message || "Lyrics unavailable.";
    lyricsText.textContent = "";
    parsedLyrics = [];
    currentLyricIndex = -1;
  } finally {
    lyricsLoading = false;
  }
}

function openLyricsPanel() {
  if (!lyricsBtn) return;
  if (!tracks.length || currentIndex === -1) {
    lyricsOpen = true;
    document.body.classList.add("lyrics-open");
    renderLyricsPanelState("Select a song to view lyrics.");
    updateLyricsButtonState();
    positionLyricsButton();
    return;
  }
  lyricsOpen = true;
  document.body.classList.add("lyrics-open");
  setQueueOpen(false);
  updateLyricsButtonState();
  positionLyricsButton();
  renderLyricsPanelState("Loading lyrics...");
  loadLyricsPanel();
}

function closeLyricsPanel() {
  lyricsOpen = false;
  lyricsLoading = false;
  document.body.classList.remove("lyrics-open");
  updateLyricsButtonState();
  positionLyricsButton();
}

function toggleLyricsPanel() {
  if (lyricsOpen) closeLyricsPanel();
  else openLyricsPanel();
}

function renderSearchPanel(albums, songRows) {
  if (!searchPanel) return;
  const hasQuery = Boolean(searchQuery);
  const hasResults = hasQuery && (albums.length > 0 || songRows.length > 0);
  searchPanel.hidden = !hasResults;
  searchPanel.innerHTML = "";

  if (!hasResults) return;

  if (albums.length) {
    const albumGroup = document.createElement("div");
    albumGroup.className = "search-group";
    const heading = document.createElement("span");
    heading.className = "search-group-title";
    heading.textContent = "Albums";
    albumGroup.append(heading);

    albums.slice(0, 4).forEach((album) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "search-item";
      item.addEventListener("click", () => {
        if (searchPanel) searchPanel.hidden = true;
        openAlbum(album.name);
      });

      const art = document.createElement("div");
      if (album.coverUrl) {
        art.className = "search-item-art";
        const img = document.createElement("img");
        img.src = album.coverUrl;
        img.alt = "";
        art.append(img);
      } else {
        art.className = "search-item-art search-item-art-placeholder";
        art.textContent = "♪";
      }

      const copy = document.createElement("div");
      copy.className = "search-item-copy";
      const title = document.createElement("strong");
      title.textContent = album.name;
      const meta = document.createElement("small");
      meta.textContent = `${album.tracks.length} ${album.tracks.length === 1 ? "song" : "songs"}`;
      copy.append(title, meta);
      
      item.append(art, copy);
      albumGroup.append(item);
    });

    searchPanel.append(albumGroup);
  }

  if (songRows.length) {
    const songGroup = document.createElement("div");
    songGroup.className = "search-group";
    const heading = document.createElement("span");
    heading.className = "search-group-title";
    heading.textContent = "Songs";
    songGroup.append(heading);

    songRows.slice(0, 6).forEach(({ track, index, plays }) => {
      const item = document.createElement("div");
      item.className = "search-item";
      item.setAttribute("role", "button");
      item.tabIndex = 0;
      item.setAttribute("aria-label", `Play ${track.title}`);

      item.addEventListener("click", (event) => {
        if (!event.target.closest(".track-options-btn")) {
          if (searchPanel) searchPanel.hidden = true;
          setQueueContextList(searchQuery ? "search" : "mostPlayed", songRows.map((row) => row.index), index);
          loadTrack(index);
        }
      });

      item.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
          event.preventDefault();
          if (searchPanel) searchPanel.hidden = true;
          setQueueContextList(searchQuery ? "search" : "mostPlayed", songRows.map((row) => row.index), index);
          loadTrack(index);
        }
      });

      const art = document.createElement("div");
      if (track.coverUrl) {
        art.className = "search-item-art";
        const img = document.createElement("img");
        img.src = track.coverUrl;
        img.alt = "";
        art.append(img);
      } else {
        art.className = "search-item-art search-item-art-placeholder";
        art.textContent = "♪";
      }

      const copy = document.createElement("div");
      copy.className = "search-item-copy";
      const title = document.createElement("strong");
      title.textContent = track.title;
      const meta = document.createElement("small");
      const source = track.album || track.repo || "";
      meta.textContent = `${source}${source ? " - " : ""}${plays} plays`;
      copy.append(title, meta);

      const optionsBtn = document.createElement("button");
      optionsBtn.className = "track-options-btn";
      optionsBtn.type = "button";
      optionsBtn.setAttribute("title", "Options");
      optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
      optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
      optionsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openTrackDropdown(track, optionsBtn, "search");
      });

      item.append(art, copy, optionsBtn);
      songGroup.append(item);
    });

    searchPanel.append(songGroup);
  }
}

function baseQueueItems({ ignoreShuffle = false } = {}) {
  const currentTrack = tracks[currentIndex];
  if (!currentTrack) return [];

  if (queueContext.mode === "list" && queueContext.indices.length) {
    return queueContext.indices.map((index) => ({ track: tracks[index], index })).filter((item) => item.track);
  }

  const repo = currentTrack.repo;
  return tracks
    .map((track, index) => ({ track, index }))
    .filter((item) => item.track && item.track.repo === repo);
}

function currentQueueTracks() {
  const currentTrack = tracks[currentIndex];
  if (!currentTrack) return [];
  if (shuffle && shuffleQueueIndices.length) {
    return shuffleQueueIndices
      .map((index) => ({ track: tracks[index], index }))
      .filter((item) => item.track);
  }
  return baseQueueItems();
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
  const baseQueue = baseQueueItems({ ignoreShuffle: true });
  const items = baseQueue.length ? baseQueue : tracks.map((track, index) => ({ track, index }));
  shuffleQueueIndices = shuffledIndices(items);
  shuffleQueueMode = queueContext.label || "album";
}

function playAlbum(album) {
  if (!album) return;
  const albumIndices = album.tracks.map((item) => item.index);
  setQueueContextList(album.name, albumIndices, album.firstIndex);
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
  favoriteBtn.setAttribute("aria-label", active ? "Unlike" : "Like");
  favoriteBtn.setAttribute("title", active ? "Unlike" : "Like");
}

function fileExtension(fileName) { return fileName.split(".").pop().toLowerCase(); }
function isAudioFile(fileName) { return audioExtensions.has(fileExtension(fileName)); }
function isImageFile(fileName) { return imageExtensions.has(fileExtension(fileName)); }
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

async function loadTrack(index, autoplay = true, rebuildQueue = true) {
  if (!tracks[index]) return;
  if (rebuildQueue) {
    initQueueFromContext(index);
  }
  currentIndex = index;
  countedTrackId = "";
  document.body.classList.add("has-track");
  refreshQueueToggleVisibility();
  if (isMobileViewport() && !document.body.classList.contains("player-fullscreen")) {
    document.body.classList.add("player-collapsed");
  }
  const track = tracks[currentIndex];
  statusText.textContent = "Loading";
  let playableUrl;
  try {
    playableUrl = await getPlayableUrl(track);
  } catch (error) {
    statusText.textContent = error.message;
    return;
  }
  
  ensureAudioGraph();
  
  audio.crossOrigin = track.source === "github" && !githubToken ? "anonymous" : "";
  audio.src = playableUrl;
  audio.load();
  trackTitle.textContent = track.title;
  setTimeout(updateTitleMarquee, 50);
  trackMeta.textContent = track.source === "github"
    ? track.album
    : "Local File";
  if (coverArt) {
    const cover = track.coverUrl || "";
    const coverWrap = coverArt.closest(".cover");
    if (cover) {
      coverArt.src = cover;
      coverArt.hidden = false;
      coverWrap?.classList.add("has-cover");
    } else {
      coverArt.removeAttribute("src");
      coverArt.hidden = true;
      coverWrap?.classList.remove("has-cover");
    }
  }
  statusText.textContent = autoplay ? "Now playing" : "Ready";
  installMediaActionHandlers();
  setMediaMetadata(track);
  setMediaPlaybackState();
  updateFavoriteButton();
  updateLyricsButtonState();
  renderPlaylist();
  renderHome();
  const ticker = document.querySelector("#lyricsTicker");
  if (ticker) {
    ticker.textContent = "";
    ticker.hidden = true;
  }
  if (lyricsOpen) {
    loadLyricsPanel();
  } else {
    preloadLyrics(track);
  }

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
  if (isMediaElementConnected) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioContextClass();
    source = audioContext.createMediaElementSource(audio);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    isMediaElementConnected = true;
  } catch(e) {
    console.error("Audio graph connection failed:", e);
  }
}

async function playAudio() {
  if (currentIndex === -1 && tracks.length) loadTrack(0, false);
  if (currentIndex === -1) return;
  await ensureAudioGraph();
  if (audioContext && audioContext.state === "suspended") await audioContext.resume();
  await audio.play().catch(()=>{});
  triggerVisualizer();
}

function triggerVisualizer() {
  if (visualizerAnimationId) return;
  if (audio.paused) return;
  if (!isMobileViewport()) return;
  if (!document.body.classList.contains("player-fullscreen")) return;
  
  startVisualizer();
}

function startVisualizer() {
  const canvas = document.getElementById("visualizerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  };
  resizeCanvas();

  const bufferLength = analyser ? analyser.frequencyBinCount : 0;
  const dataArray = new Uint8Array(bufferLength);

  // Dynamic animation states for continuous liquid-like movement
  let angle1 = 0;
  let angle2 = 0;
  let driftTime = 0;

  function draw() {
    if (!audio.paused && document.body.classList.contains("player-fullscreen") && isMobileViewport()) {
      visualizerAnimationId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      visualizerAnimationId = null;
      return;
    }

    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 1. Bass / Low frequencies (bins 0-4) for outer background layer
    let bassSum = 0;
    const bassBins = Math.min(5, bufferLength);
    for (let i = 0; i < bassBins; i++) {
      bassSum += dataArray[i];
    }
    const bassAvg = bassBins > 0 ? bassSum / bassBins : 0;

    // 2. Mid frequencies (bins 5-15) for inner layer
    let midsSum = 0;
    const startMids = Math.min(5, bufferLength);
    const endMids = Math.min(15, bufferLength);
    const midsBins = endMids - startMids;
    for (let i = startMids; i < endMids; i++) {
      midsSum += dataArray[i];
    }
    const midsAvg = midsBins > 0 ? midsSum / midsBins : 0;

    const bassFactor = Math.min(1, (bassAvg / 255) * 1.35);
    const midsFactor = Math.min(1, (midsAvg / 255) * 1.35);

    // Update continuous rotation and drift states based on audio beats
    angle1 += 0.003 + bassFactor * 0.015;
    angle2 -= 0.005 + midsFactor * 0.010;
    driftTime += 0.008 + bassFactor * 0.012;

    // Gentle offset floating calculations to create a liquid fluid drift
    const driftX1 = Math.sin(driftTime) * width * 0.05;
    const driftY1 = Math.cos(driftTime * 0.9) * height * 0.05;
    const driftX2 = Math.cos(driftTime * 0.7) * width * 0.04;
    const driftY2 = Math.sin(driftTime * 1.1) * height * 0.04;

    const scale1 = 0.96 + Math.pow(bassFactor, 1.4) * 0.38;
    const scale2 = 0.90 + Math.pow(midsFactor, 1.4) * 0.30;

    const img = document.getElementById("coverArt");
    const hasImage = img && img.src && !img.hidden && img.complete;

    // Draw Layer 1 (Bass / Outer Glow)
    ctx.save();
    ctx.translate(centerX + driftX1, centerY + driftY1);
    ctx.rotate(angle1);
    ctx.scale(scale1, scale1);
    ctx.globalAlpha = (0.16 + bassFactor * 0.44) * 0.6; // Soft, faded alpha
    if (hasImage) {
      ctx.drawImage(img, -width * 0.46, -height * 0.46, width * 0.92, height * 0.92);
    } else {
      const fallbackGrad = ctx.createLinearGradient(-width * 0.46, -height * 0.46, width * 0.46, height * 0.46);
      fallbackGrad.addColorStop(0, "rgba(115, 208, 173, 0.85)");
      fallbackGrad.addColorStop(1, "rgba(121, 167, 255, 0.85)");
      ctx.fillStyle = fallbackGrad;
      ctx.fillRect(-width * 0.46, -height * 0.46, width * 0.92, height * 0.92);
    }
    ctx.restore();

    // Draw Layer 2 (Mids / Inner Glow)
    ctx.save();
    ctx.translate(centerX + driftX2, centerY + driftY2);
    ctx.rotate(angle2);
    ctx.scale(scale2, scale2);
    ctx.globalAlpha = (0.14 + midsFactor * 0.38) * 0.55; // Soft, faded alpha
    if (hasImage) {
      ctx.drawImage(img, -width * 0.44, -height * 0.44, width * 0.88, height * 0.88);
    } else {
      const fallbackGrad = ctx.createLinearGradient(-width * 0.44, -height * 0.44, width * 0.44, height * 0.44);
      fallbackGrad.addColorStop(0, "rgba(222, 127, 139, 0.85)");
      fallbackGrad.addColorStop(1, "rgba(241, 191, 102, 0.85)");
      ctx.fillStyle = fallbackGrad;
      ctx.fillRect(-width * 0.44, -height * 0.44, width * 0.88, height * 0.88);
    }
    ctx.restore();
  }

  draw();
}

function pauseAudio() { audio.pause(); }

function setPlayState() {
  const playing = !audio.paused;
  playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  playBtn.setAttribute("title", playing ? "Pause" : "Play");
  playIcon.innerHTML = playing
    ? '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>'
    : '<path d="m8 5 11 7-11 7V5Z"/>';
  statusText.textContent = currentIndex === -1 ? "Choose audio files to begin" : playing ? "Now playing" : "Paused";
  document.body.classList.toggle("is-playing", playing);
  document.body.classList.toggle("has-track", currentIndex !== -1);
  setMediaPlaybackState();
  setMediaPositionState();
}

function positionFavoriteButton() {
  if (!favoriteBtn || !titleActions) return;
  const mobile = isMobileViewport();
  if (mobile) {
    if (document.body.classList.contains("player-fullscreen")) {
      titleActions.setAttribute("aria-hidden", "true");
      if (fullActionsRight && favoriteBtn.parentElement !== fullActionsRight) {
        fullActionsRight.appendChild(favoriteBtn);
      }
      return;
    }
    const collapsed = document.body.classList.contains("player-collapsed");
    if (collapsed) {
      titleActions.setAttribute("aria-hidden", "true");
      if (playerRightActions) {
        playerRightActions.removeAttribute("aria-hidden");
        if (favoriteBtn.parentElement !== playerRightActions) playerRightActions.appendChild(favoriteBtn);
      } else {
        const controls = document.querySelector(".controls");
        if (!controls) return;
        if (favoriteBtn.parentElement !== controls) controls.appendChild(favoriteBtn);
      }
      return;
    }
    titleActions.removeAttribute("aria-hidden");
    if (favoriteBtn.parentElement !== titleActions) titleActions.appendChild(favoriteBtn);
  } else {
    titleActions.setAttribute("aria-hidden", "true");
    const controls = document.querySelector(".controls");
    if (!controls) return;
    if (favoriteBtn.parentElement !== controls) {
      controls.insertBefore(favoriteBtn, repeatBtn || null);
    }
  }
}

function positionMuteButton() {
  if (!muteBtn) return;
  const mobile = isMobileViewport();
  const controls = document.querySelector(".controls");
  if (!controls) return;

  if (mobile) {
    if (document.body.classList.contains("player-fullscreen")) {
      if (fullActionsRight && muteBtn.parentElement !== fullActionsRight) {
        const heart = favoriteBtn;
        if (heart && heart.parentElement === fullActionsRight) fullActionsRight.insertBefore(muteBtn, heart);
        else fullActionsRight.appendChild(muteBtn);
      }
      return;
    }
    if (document.body.classList.contains("player-collapsed")) {
      if (muteBtn.parentElement !== controls) controls.insertBefore(muteBtn, repeatBtn || null);
      return;
    }
    const heartContainer = titleActions;
    if (heartContainer && heartContainer !== controls) heartContainer.removeAttribute("aria-hidden");
    const heart = favoriteBtn;
    if (heart && heart.parentElement === heartContainer) {
      if (muteBtn.parentElement !== heartContainer) heartContainer.insertBefore(muteBtn, heart);
      else if (muteBtn.nextElementSibling !== heart) heartContainer.insertBefore(muteBtn, heart);
      return;
    }
    if (muteBtn.parentElement !== controls) controls.insertBefore(muteBtn, repeatBtn || null);
    return;
  }

  if (playerRightActions) {
    playerRightActions.removeAttribute("aria-hidden");
    if (muteBtn.parentElement !== playerRightActions) playerRightActions.appendChild(muteBtn);
  } else if (muteBtn.parentElement !== controls) {
    controls.insertBefore(muteBtn, repeatBtn || null);
  }
}

function nextTrack() {
  if (!queueList.length) {
    if (tracks.length) {
      initQueueFromContext(currentIndex >= 0 ? currentIndex : 0);
    } else {
      return;
    }
  }

  if (queueList.length > 1) {
    const current = queueList.shift();
    playbackHistory.push(current);
    currentIndex = queueList[0].index;
    loadTrack(currentIndex, !audio.paused, false);
  } else {
    if (repeat === "all") {
      const firstIdx = playbackHistory.length > 0 ? playbackHistory[0].index : (queueList[0] ? queueList[0].index : 0);
      initQueueFromContext(firstIdx);
      if (queueList.length) {
        currentIndex = queueList[0].index;
        loadTrack(currentIndex, true, false);
      } else {
        statusText.textContent = "Queue finished";
        pauseAudio();
      }
    } else {
      statusText.textContent = "Queue finished";
      pauseAudio();
    }
  }
}

function previousTrack() {
  if (!tracks.length) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  
  if (!queueList.length) {
    initQueueFromContext(currentIndex >= 0 ? currentIndex : 0);
  }

  if (playbackHistory.length > 0) {
    const prev = playbackHistory.pop();
    queueList.unshift(prev);
    currentIndex = queueList[0].index;
    loadTrack(currentIndex, !audio.paused, false);
  } else {
    audio.currentTime = 0;
  }
}

function removeTrack(id) {
  const index = tracks.findIndex((track) => track.id === id);
  if (index === -1) return;
  const [removed] = tracks.splice(index, 1);
  shuffleQueueIndices = shuffleQueueIndices
    .filter((trackIndex) => trackIndex !== index)
    .map((trackIndex) => (trackIndex > index ? trackIndex - 1 : trackIndex));
  if (queueContext.mode === "list" && queueContext.indices.length) {
    queueContext.indices = queueContext.indices
      .filter((trackIndex) => trackIndex !== index)
      .map((trackIndex) => (trackIndex > index ? trackIndex - 1 : trackIndex));
    if (!queueContext.indices.length) setQueueContextRepo();
  }
  if (removed.source === "local") URL.revokeObjectURL(removed.url);
  if (removed.objectUrl) URL.revokeObjectURL(removed.objectUrl);

  if (!tracks.length) {
    currentIndex = -1;
    audio.removeAttribute("src");
    audio.load();
    trackTitle.textContent = "No track loaded";
    updateTitleMarquee();
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

function initQueueFromContext(startIndex) {
  queueList = [];
  playbackHistory = [];

  const contextItems = baseQueueItems({ ignoreShuffle: true });
  if (!contextItems.length) {
    tracks.forEach((track, index) => {
      contextItems.push({ track, index });
    });
  }

  const clickedPos = contextItems.findIndex(item => item.index === startIndex);
  if (clickedPos === -1) {
    const track = tracks[startIndex];
    if (track) {
      queueList.push({ track, index: startIndex, queueId: makeId(), userAdded: false });
    }
    return;
  }

  const clickedItem = contextItems[clickedPos];
  queueList.push({
    track: clickedItem.track,
    index: clickedItem.index,
    queueId: makeId(),
    userAdded: false
  });

  for (let i = clickedPos + 1; i < contextItems.length; i++) {
    queueList.push({
      track: contextItems[i].track,
      index: contextItems[i].index,
      queueId: makeId(),
      userAdded: false
    });
  }

  for (let i = 0; i < clickedPos; i++) {
    playbackHistory.push({
      track: contextItems[i].track,
      index: contextItems[i].index,
      queueId: makeId(),
      userAdded: false
    });
  }
}

function playQueueItem(queueIdx) {
  if (queueIdx === 0) return;
  for (let i = 0; i < queueIdx; i++) {
    playbackHistory.push(queueList.shift());
  }
  currentIndex = queueList[0].index;
  loadTrack(currentIndex, true, false);
}

function removeQueueItem(queueIdx) {
  if (queueIdx === 0) return;
  queueList.splice(queueIdx, 1);
  renderPlaylist();
}

function addTrackToQueue(track) {
  const qItem = {
    track: track,
    index: tracks.indexOf(track),
    queueId: makeId(),
    userAdded: true
  };

  let insertIndex = 1;
  while (insertIndex < queueList.length && queueList[insertIndex].userAdded) {
    insertIndex++;
  }
  queueList.splice(insertIndex, 0, qItem);
  
  showToast(`"${track.title}" added to play next`, "success");
  renderPlaylist();
}

let dragItem = null;
let dragStartIdx = -1;

function startDrag(e, li, index) {
  e.preventDefault();
  dragItem = li;
  dragStartIdx = index;
  li.classList.add("dragging");

  const onMove = (moveEvent) => {
    moveEvent.preventDefault();
    const y = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
    
    const siblings = [...playlistEl.querySelectorAll('.track:not(.dragging)')];
    const playingCard = playlistEl.querySelector('.track.active');
    let playingCardBottom = 0;
    if (playingCard) {
      playingCardBottom = playingCard.getBoundingClientRect().bottom;
    }

    if (y < playingCardBottom) {
      return;
    }

    const nextSibling = siblings.find(sibling => {
      if (sibling === playingCard) return false;
      const rect = sibling.getBoundingClientRect();
      return y < rect.top + rect.height / 2;
    });

    if (nextSibling) {
      playlistEl.insertBefore(li, nextSibling);
    } else {
      playlistEl.appendChild(li);
    }
  };

  const onEnd = () => {
    li.classList.remove("dragging");
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);

    const newDOMItems = [...playlistEl.querySelectorAll('.track')];
    const newQueueList = [];
    
    newQueueList.push(queueList[0]);

    newDOMItems.forEach(domItem => {
      const qId = domItem.dataset.queueId;
      if (qId && qId !== queueList[0].queueId) {
        const item = queueList.find(q => q.queueId === qId);
        if (item) newQueueList.push(item);
      }
    });

    queueList = newQueueList;
    dragItem = null;
    dragStartIdx = -1;
    
    renderPlaylist();
  };

  document.addEventListener("mousemove", onMove, { passive: false });
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  refreshQueueToggleVisibility();

  if (!queueList.length && tracks.length) {
    initQueueFromContext(currentIndex >= 0 ? currentIndex : 0);
  }

  queueList.forEach((item, queueIndex) => {
    const track = item.track;
    const index = item.index;
    const li = document.createElement("li");
    li.className = `track${queueIndex === 0 ? " active" : ""}`;
    li.dataset.queueId = item.queueId;

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "drag-handle-btn";
    dragHandle.setAttribute("aria-label", "Drag to reorder");
    dragHandle.innerHTML = `<svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>`;
    
    if (queueIndex === 0) {
      dragHandle.style.visibility = "hidden";
      dragHandle.style.pointerEvents = "none";
    } else {
      dragHandle.addEventListener("mousedown", (e) => startDrag(e, li, queueIndex));
      dragHandle.addEventListener("touchstart", (e) => startDrag(e, li, queueIndex), { passive: false });
    }

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "track-select-btn";
    selectButton.setAttribute("aria-label", `Play ${track.title}`);
    selectButton.addEventListener("click", () => playQueueItem(queueIndex));

    const isCurrent = (queueIndex === 0);
    const number = document.createElement("span");
    number.className = isCurrent ? "track-index active-playing" : "track-index";
    if (isCurrent) {
      number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
    } else {
      number.textContent = queueIndex;
    }

    const copy = document.createElement("span");
    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = track.title;
    const meta = document.createElement("small");
    meta.textContent = track.source === "github" ? track.album : "Local File";
    copy.append(title, meta);
    selectButton.append(number, copy);

    const fav = document.createElement("button");
    fav.className = `fav${isFavorite(track) ? " active" : ""}`;
    fav.type = "button";
    fav.setAttribute("aria-label", isFavorite(track) ? `Unlike ${track.title}` : `Like ${track.title}`);
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    fav.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track);
    });

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", `Remove from Queue`);
    if (queueIndex === 0) {
      remove.style.visibility = "hidden";
      remove.style.pointerEvents = "none";
    } else {
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        removeQueueItem(queueIndex);
      });
    }

    li.append(dragHandle, selectButton, fav, remove);
    playlistEl.append(li);
  });

  emptyState.classList.toggle("hidden", queueList.length > 0);
  trackCount.textContent = `${queueList.length} ${queueList.length === 1 ? "track" : "tracks"}`;
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

function generateDailyMixes() {
  if (!tracks.length) return;

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const cacheKey = "swiftMusicDailyMixesV1";

  // Check if we have a valid cache for today and matching the current number of tracks
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && cached.date === today && cached.trackCount === tracks.length && cached.mixes) {
      dailyMixes = cached.mixes;
      return;
    }
  } catch (e) {
    console.warn("Failed to parse cached daily mixes:", e);
  }

  const mix1Tracks = [];
  const mix2Tracks = [];
  const mix3Tracks = [];

  tracks.forEach(track => {
    const albumName = track.album || "";
    if (albumName.includes("1989") || albumName.includes("Reputation")) {
      mix1Tracks.push(track.key);
    } else if (albumName.includes("Lover") || albumName.includes("Midnights")) {
      mix2Tracks.push(track.key);
    }
    mix3Tracks.push(track.key);
  });

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  let finalMix1 = shuffleArray(mix1Tracks).slice(0, 12);
  let finalMix2 = shuffleArray(mix2Tracks).slice(0, 12);
  let finalMix3 = shuffleArray(mix3Tracks).slice(0, 15);

  if (!finalMix1.length) finalMix1 = shuffleArray(tracks.map(t => t.key)).slice(0, 8);
  if (!finalMix2.length) finalMix2 = shuffleArray(tracks.map(t => t.key)).slice(0, 8);
  if (!finalMix3.length) finalMix3 = shuffleArray(tracks.map(t => t.key)).slice(0, 10);

  dailyMixes = {
    "Daily Mix 1": finalMix1,
    "Daily Mix 2": finalMix2,
    "Daily Mix 3": finalMix3
  };

  // Cache to localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      date: today,
      trackCount: tracks.length,
      mixes: dailyMixes
    }));
  } catch (e) {
    console.warn("Failed to write daily mixes to cache:", e);
  }
}

function renderDailyMixes() {
  const dailyMixGrid = document.querySelector("#dailyMixGrid");
  if (!dailyMixGrid) return;
  dailyMixGrid.innerHTML = "";

  if (!tracks.length) {
    dailyMixGrid.innerHTML = '<span class="status" style="font-size: 0.8rem; font-weight: 500;">Loading mixes...</span>';
    return;
  }

  generateDailyMixes();

  const mixGradients = {
    "Daily Mix 1": "linear-gradient(135deg, #ff7e5f, #feb47b)",
    "Daily Mix 2": "linear-gradient(135deg, #00c6ff, #0072ff)",
    "Daily Mix 3": "linear-gradient(135deg, #f857a6, #ff5858)"
  };

  const mixSubtitles = {
    "Daily Mix 1": "Upbeat pop hits & anthems",
    "Daily Mix 2": "Chill synthpop & late-night tunes",
    "Daily Mix 3": "A perfect blend of all tracks"
  };

  Object.keys(dailyMixes).forEach((name) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `daily-mix-card${name === selectedPlaylistName ? " active" : ""}`;
    
    const art = document.createElement("span");
    art.className = "daily-mix-art";
    art.style.background = mixGradients[name] || "linear-gradient(135deg, var(--blue), var(--mint))";

    const info = document.createElement("div");
    info.className = "daily-mix-info";
    
    const title = document.createElement("strong");
    title.textContent = name;
    
    const subtitle = document.createElement("span");
    subtitle.textContent = mixSubtitles[name] || "Custom dynamic mix for you";

    info.append(title, subtitle);
    card.append(art, info);

    card.addEventListener("click", () => {
      selectedPlaylistName = (selectedPlaylistName === name) ? "" : name;
      selectedAlbumName = "";
      favoritesOpen = false;
      renderHome();
    });

    dailyMixGrid.append(card);
  });
}

function renderPlaylistArt(targetEl, trackKeys = []) {
  if (!targetEl) return;
  targetEl.innerHTML = "";
  targetEl.style.display = "";
  targetEl.style.gridTemplateColumns = "";
  targetEl.style.gridTemplateRows = "";
  targetEl.style.overflow = "";
  targetEl.style.background = "";
  targetEl.classList.remove("has-cover");

  const playlistTracks = trackKeys
    .map(key => tracks.find(t => t.key === key))
    .filter(Boolean);

  const coverUrls = [];
  playlistTracks.forEach(track => {
    if (track.coverUrl && !coverUrls.includes(track.coverUrl)) {
      coverUrls.push(track.coverUrl);
    }
  });

  if (coverUrls.length === 0) {
    targetEl.style.background = "linear-gradient(135deg, var(--blue), var(--mint))";
  } else if (coverUrls.length < 4) {
    targetEl.classList.add("has-cover");
    const img = document.createElement("img");
    img.src = coverUrls[0];
    img.alt = "Playlist cover";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    targetEl.append(img);
  } else {
    targetEl.style.display = "grid";
    targetEl.style.gridTemplateColumns = "repeat(2, 1fr)";
    targetEl.style.gridTemplateRows = "repeat(2, 1fr)";
    targetEl.style.overflow = "hidden";
    
    const maxCovers = Math.min(coverUrls.length, 4);
    for (let i = 0; i < maxCovers; i++) {
      const img = document.createElement("img");
      img.src = coverUrls[i];
      img.alt = "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      targetEl.append(img);
    }
  }
}

function generateRecommendations() {
  if (!tracks.length) return;

  const cacheKey = "swiftMusicRecommendedV1";
  const oneHourMs = 60 * 60 * 1000;
  const now = Date.now();

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && (now - cached.timestamp < oneHourMs) && cached.trackCount === tracks.length && cached.trackKeys && cached.trackKeys.length) {
      const allExist = cached.trackKeys.every(key => tracks.some(t => t.key === key));
      if (allExist) {
        recommendedTracks = cached.trackKeys;
        return;
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached recommendations:", e);
  }

  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  const count = Math.min(tracks.length, 10);
  const selected = shuffled.slice(0, count).map(t => t.key);

  recommendedTracks = selected;

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: now,
      trackCount: tracks.length,
      trackKeys: selected
    }));
  } catch (e) {
    console.warn("Failed to save recommendations cache:", e);
  }
}

function renderRecommendations() {
  const recommendedGrid = document.querySelector("#recommendedGrid");
  if (!recommendedGrid) return;
  recommendedGrid.innerHTML = "";

  const section = recommendedGrid.closest(".home-section");
  if (!tracks.length || searchQuery) {
    if (section) section.hidden = true;
    return;
  }
  if (section) section.hidden = false;

  generateRecommendations();

  const recTracks = recommendedTracks
    .map(key => tracks.map((t, idx) => ({ t, idx })).find(item => item.t.key === key))
    .filter(Boolean);

  recTracks.forEach(({ t: track, idx: index }, rank) => {
    const button = document.createElement("div");
    button.className = `song-row${index === currentIndex ? " active" : ""}`;
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.setAttribute("aria-label", `Play ${track.title}`);

    button.addEventListener("click", (event) => {
      if (!event.target.closest(".track-options-btn")) {
        setQueueContextList("Recommended", recTracks.map(i => i.idx), index);
        loadTrack(index);
      }
    });

    button.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
        event.preventDefault();
        setQueueContextList("Recommended", recTracks.map(i => i.idx), index);
        loadTrack(index);
      }
    });

    const isCurrent = (index === currentIndex);
    const number = document.createElement("span");
    number.className = isCurrent ? "song-number active-playing" : "song-number";
    if (isCurrent) {
      number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
    } else {
      number.textContent = rank + 1;
    }

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    const plays = playCountFor(track);
    const metaText = [
      `${plays} ${plays === 1 ? "play" : "plays"}`,
      track.album || track.repo || ""
    ].filter(Boolean).join(" • ");
    meta.textContent = metaText;
    copy.append(title, meta);

    const optionsBtn = document.createElement("button");
    optionsBtn.className = "track-options-btn";
    optionsBtn.type = "button";
    optionsBtn.setAttribute("title", "Options");
    optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
    optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
    optionsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openTrackDropdown(track, optionsBtn, "recommended");
    });

    button.append(number, copy, optionsBtn);
    recommendedGrid.append(button);
  });
}

function renderHome() {
  renderDailyMixes();
  renderRecommendations();
  const allAlbums = [...groupedAlbums().values()];
  searchQuery = normalizeSearchQuery(searchInput?.value);
  const searchAlbums = searchQuery ? allAlbums.filter((album) => albumMatchesSearch(album, searchQuery)) : [];
  albumGrid.innerHTML = "";
  songGrid.innerHTML = "";

  if (!tracks.length) {
    albumGrid.innerHTML = '<div class="home-empty">Albums will appear here once the GitHub library loads.</div>';
    songGrid.innerHTML = '<div class="home-empty">Songs will appear here once the GitHub library loads.</div>';
  }

  allAlbums.forEach((album, albumIndex) => {
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
  const songRows = searchQuery
    ? tracks
      .map((track, index) => ({ track, index, plays: playCountFor(track) }))
      .filter((item) => trackSearchText(item.track).includes(searchQuery))
      .sort((a, b) => {
        const aExact = trackTitleMatchesSearch(a.track, searchQuery) ? 1 : 0;
        const bExact = trackTitleMatchesSearch(b.track, searchQuery) ? 1 : 0;
        return bExact - aExact || b.plays - a.plays || a.track.title.localeCompare(b.track.title);
      })
    : mostPlayedTracks;
  const songQueueIndices = songRows.map((item) => item.index);
  const songLabel = searchQuery ? "Search Results" : "Most Played";
  if (songsHeading) songsHeading.textContent = songLabel;

  songRows.forEach(({ track, index, plays }, rank) => {
    const button = document.createElement("div");
    button.className = `song-row${index === currentIndex ? " active" : ""}`;
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.setAttribute("aria-label", `Play ${track.title}`);

    button.addEventListener("click", (event) => {
      if (!event.target.closest(".track-options-btn")) {
        setQueueContextList(searchQuery ? "search" : "mostPlayed", songQueueIndices, index);
        loadTrack(index);
      }
    });

    button.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
        event.preventDefault();
        setQueueContextList(searchQuery ? "search" : "mostPlayed", songQueueIndices, index);
        loadTrack(index);
      }
    });

    const isCurrent = (index === currentIndex);
    const number = document.createElement("span");
    number.className = isCurrent ? "song-number active-playing" : "song-number";
    if (isCurrent) {
      number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
    } else {
      number.textContent = rank + 1;
    }

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    const metaText = [
      `${plays} ${plays === 1 ? "play" : "plays"}`,
      track.album || track.repo || ""
    ].filter(Boolean).join(" • ");
    meta.textContent = metaText;
    copy.append(title, meta);

    const optionsBtn = document.createElement("button");
    optionsBtn.className = "track-options-btn";
    optionsBtn.type = "button";
    optionsBtn.setAttribute("title", "Options");
    optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
    optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
    optionsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openTrackDropdown(track, optionsBtn, "home");
    });

    button.append(number, copy, optionsBtn);
    songGrid.append(button);
  });

  if (searchQuery && !songRows.length) {
    songGrid.innerHTML = '<div class="home-empty">No songs match your search.</div>';
  } else if (tracks.length && !mostPlayedTracks.length && !searchQuery) {
    songGrid.innerHTML = '<div class="home-empty">Play a few songs and your most played tracks will appear here.</div>';
  }

  const favoriteTracks = tracks
    .map((track, index) => ({ track, index }))
    .filter((item) => isFavorite(item.track));

  const playlistGrid = document.querySelector("#playlistGrid");
  if (playlistGrid) {
    playlistGrid.innerHTML = "";
    
    // Add Saved Songs (Favorites) as a card in the playlists grid
    const favCard = document.createElement("button");
    favCard.className = `album-card${favoritesOpen ? " active" : ""}`;
    favCard.type = "button";
    
    const favArt = document.createElement("span");
    favArt.className = "album-art liked-songs-art";
    favArt.style.background = "linear-gradient(135deg, var(--rose), var(--amber))";
    favArt.style.display = "grid";
    favArt.style.placeItems = "center";
    favArt.style.color = "var(--ink)";
    favArt.innerHTML = `<svg viewBox="0 0 24 24" style="width:36px; height:36px; fill:currentColor; stroke:currentColor;"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>`;
    
    favCard.append(favArt, Object.assign(document.createElement("span"), {
      innerHTML: `<strong>Liked Songs</strong><span>${favoriteTracks.length} songs</span>`
    }));
    
    favCard.addEventListener("click", () => {
      openFavorites();
    });
    playlistGrid.append(favCard);

    // Custom Playlists
    Object.keys(customPlaylists).forEach(pName => {
      const card = document.createElement("button");
      card.className = `album-card${pName === selectedPlaylistName ? " active" : ""}`;
      card.type = "button";
      
      const art = document.createElement("span");
      art.className = "album-art";
      renderPlaylistArt(art, customPlaylists[pName]);
      
      card.append(art, Object.assign(document.createElement("span"), {
        innerHTML: `<strong>${pName}</strong><span>${customPlaylists[pName].length} songs</span>`
      }));
      
      card.addEventListener("click", () => {
        selectedPlaylistName = (selectedPlaylistName === pName) ? "" : pName;
        selectedAlbumName = "";
        favoritesOpen = false;
        renderHome();
      });
      playlistGrid.append(card);
    });
  }

  const playlistDetail = document.querySelector("#playlistDetail");
  const playlistSongList = document.querySelector("#playlistSongList");
  if (playlistDetail && playlistSongList) {
    const isOpen = Boolean(selectedPlaylistName);
    playlistDetail.hidden = !isOpen;
    playlistSongList.innerHTML = "";
    
    if (isOpen) {
      const isDailyMix = Boolean(dailyMixes[selectedPlaylistName]);
      document.querySelector("#playlistDetailTitle").textContent = selectedPlaylistName;
      const trackKeysCount = isDailyMix ? (dailyMixes[selectedPlaylistName]?.length || 0) : (customPlaylists[selectedPlaylistName]?.length || 0);
      document.querySelector("#playlistDetailMeta").textContent = `${trackKeysCount} ${trackKeysCount === 1 ? "song" : "songs"}`;
      
      const optionsBtn = document.querySelector("#playlistOptionsBtn");
      const optionsDropdown = document.querySelector("#playlistOptionsDropdown");
      const saveDailyMixBtn = document.querySelector("#saveDailyMixBtn");

      if (saveDailyMixBtn) {
        saveDailyMixBtn.hidden = !isDailyMix;
        if (isDailyMix) {
          saveDailyMixBtn.onclick = (e) => {
            e.stopPropagation();
            openPlaylistModal("saveDailyMix", selectedPlaylistName);
          };
        }
      }

      if (optionsBtn && optionsDropdown) {
        optionsBtn.style.display = isDailyMix ? "none" : "";
        optionsDropdown.hidden = true;
        optionsBtn.onclick = (e) => {
          e.stopPropagation();
          optionsDropdown.hidden = !optionsDropdown.hidden;
        };
      }

      document.querySelector("#deletePlaylistBtn").onclick = () => {
        if (optionsDropdown) optionsDropdown.hidden = true;
        deletePlaylist(selectedPlaylistName);
      };
      
      const renameBtn = document.querySelector("#renamePlaylistBtn");
      if (renameBtn) {
        renameBtn.onclick = () => {
          if (optionsDropdown) optionsDropdown.hidden = true;
          openPlaylistModal("rename", selectedPlaylistName);
        };
      }

      const detailDescription = document.querySelector("#playlistDetailDescription");
      if (detailDescription) {
        if (isDailyMix) {
          const mixSubtitles = {
            "Daily Mix 1": "A custom blend of your favorite high-energy pop hits, tailored just for you.",
            "Daily Mix 2": "A smooth selection of synthpop and dreamy melodies for a late-night vibe.",
            "Daily Mix 3": "A curated mixture of all available tracks in your music library."
          };
          detailDescription.textContent = mixSubtitles[selectedPlaylistName] || "A custom daily mix personalized for you.";
        } else {
          detailDescription.textContent = "A custom playlist collection created by you. Add songs easily using the '+' icon next to tracks in the dashboard.";
        }
      }

      const playlistArt = document.querySelector("#playlistDetailArt");
      if (playlistArt) {
        playlistArt.style.display = "";
        playlistArt.style.gridTemplateColumns = "";
        playlistArt.style.gridTemplateRows = "";
        playlistArt.style.overflow = "";
        playlistArt.innerHTML = "";
        if (isDailyMix) {
          const mixGradients = {
            "Daily Mix 1": "linear-gradient(135deg, #ff7e5f, #feb47b)",
            "Daily Mix 2": "linear-gradient(135deg, #00c6ff, #0072ff)",
            "Daily Mix 3": "linear-gradient(135deg, #f857a6, #ff5858)"
          };
          playlistArt.style.background = mixGradients[selectedPlaylistName] || "";
          const icon = document.createElement("span");
          icon.className = "playlist-art-icon";
          icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" style="stroke-width: 1.5; width: 64px; height: 64px; fill: none; stroke: currentColor;"><path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6-3 3 3 0 0 1 6 3Zm12-2a3 3 0 1 1-6-3 3 3 0 0 1 6 3Z"/></svg>';
          playlistArt.append(icon);
        } else {
          renderPlaylistArt(playlistArt, customPlaylists[selectedPlaylistName]);
        }
      }
      
      const trackKeys = isDailyMix ? (dailyMixes[selectedPlaylistName] || []) : (customPlaylists[selectedPlaylistName] || []);
      const playlistTracks = trackKeys
        .map(key => tracks.map((t, idx) => ({ t, idx })).find(item => item.t.key === key))
        .filter(Boolean);
        
      document.querySelector("#playPlaylistBtn").onclick = () => {
        if(!playlistTracks.length) return;
        setQueueContextList(selectedPlaylistName, playlistTracks.map(i => i.idx), playlistTracks[0].idx);
        loadTrack(playlistTracks[0].idx);
      };

      const shufflePlayPlaylistBtn = document.querySelector("#shufflePlayPlaylistBtn");
      if (shufflePlayPlaylistBtn) {
        shufflePlayPlaylistBtn.onclick = () => {
          if(!playlistTracks.length) return;
          const indices = playlistTracks.map(i => i.idx);
          const shuffled = [...indices].sort(() => Math.random() - 0.5);
          
          setQueueContextList(selectedPlaylistName, shuffled, shuffled[0]);
          loadTrack(shuffled[0]);
          
          shuffle = true;
          shuffleBtn.classList.add("active");
        };
      }

      if (!playlistTracks.length) {
        playlistSongList.innerHTML = isDailyMix 
          ? '<div class="home-empty">Loading tracks for this mix...</div>' 
          : '<div class="home-empty">This playlist is empty. Add songs using the context ➕ option next to tracks!</div>';
      }

      playlistTracks.forEach(({ t: track, idx: index }, playlistIdx) => {
        const button = document.createElement("div");
        button.className = `playlist-song-row${index === currentIndex ? " active" : ""}`;
        button.setAttribute("role", "button");
        button.tabIndex = 0;
        button.setAttribute("aria-label", `Play ${track.title}`);

        button.addEventListener("click", (event) => {
          if (!event.target.closest(".track-options-btn")) {
            setQueueContextList(selectedPlaylistName, playlistTracks.map(i => i.idx), index);
            loadTrack(index);
          }
        });

        button.addEventListener("keydown", (event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
            event.preventDefault();
            setQueueContextList(selectedPlaylistName, playlistTracks.map(i => i.idx), index);
            loadTrack(index);
          }
        });

        const isCurrent = (index === currentIndex);
        const number = document.createElement("span");
        number.className = isCurrent ? "song-number active-playing" : "song-number";
        if (isCurrent) {
          number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
        } else {
          number.textContent = playlistIdx + 1;
        }

        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = track.title;
        const meta = document.createElement("span");
        meta.textContent = track.album || "";
        if (track.album) {
          copy.append(title, meta);
        } else {
          copy.append(title);
        }

        const optionsBtn = document.createElement("button");
        optionsBtn.className = "track-options-btn";
        optionsBtn.type = "button";
        optionsBtn.setAttribute("title", "Options");
        optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
        optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
        optionsBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          openTrackDropdown(track, optionsBtn, "playlist");
        });

        button.append(number, copy, optionsBtn);
        playlistSongList.append(button);
      });
    }
  }

  albumCount.textContent = `${allAlbums.length} ${allAlbums.length === 1 ? "album" : "albums"}`;
  const totalPlays = tracks.reduce((total, track) => total + playCountFor(track), 0);
  songCount.textContent = `${totalPlays} ${totalPlays === 1 ? "play" : "plays"}`;
  sidebarLibraryCount.textContent = `${allAlbums.length} albums, ${tracks.length} songs`;
  renderAlbumDetail(allAlbums);
  renderFavoritesDetail();
  if (!tracks.length) {
    libraryStatus.textContent = "Loading songs from GitHub...";
    libraryStatus.className = "status-loading";
  } else if (searchQuery) {
    libraryStatus.textContent = `Searching for "${searchInput?.value.trim() || searchQuery}"`;
    libraryStatus.className = "status-searching";
  } else {
    libraryStatus.textContent = "";
    libraryStatus.className = "status-ready";
  }

  renderSearchPanel(searchAlbums, songRows);
  setDetailWindowState();
}

if (searchInput) {
  searchInput.addEventListener("input", renderHome);
  searchInput.addEventListener("search", renderHome);
}

function openAlbum(albumName) {
  if (selectedAlbumName === albumName) {
    selectedAlbumName = "";
    favoritesOpen = false;
    selectedPlaylistName = "";
    renderHome();
    return;
  }
  selectedAlbumName = albumName;
  favoritesOpen = false;
  selectedPlaylistName = "";
  renderHome();
}

function openFavorites() {
  if (favoritesOpen) {
    favoritesOpen = false;
    renderHome();
    return;
  }
  favoritesOpen = true;
  selectedAlbumName = "";
  selectedPlaylistName = "";
  renderHome();
}

function closeDetailWindow() {
  selectedAlbumName = "";
  favoritesOpen = false;
  selectedPlaylistName = "";
  renderHome();
}

function renderAlbumDetail(albums = [...groupedAlbums().values()]) {
  const album = albums.find((item) => item.name === selectedAlbumName);
  albumDetail.hidden = !album;
  albumSongList.innerHTML = "";
  if (!album) return;

  albumDetailTitle.textContent = album.name;
  albumDetailMeta.textContent = `${album.tracks.length} ${album.tracks.length === 1 ? "song" : "songs"}`;
  if (albumDetailDescription) albumDetailDescription.textContent = albumDescription(album.name);
  renderAlbumArtwork(albumDetailArt, album);
  playAlbumBtn.onclick = () => playAlbum(album);
  
  const shufflePlayBtn = document.querySelector("#shufflePlayAlbumBtn");
  if (shufflePlayBtn) {
    shufflePlayBtn.onclick = () => {
      if(!album || !album.tracks.length) return;
      const albumIndices = album.tracks.map((item) => item.index);
      const shuffled = [...albumIndices].sort(() => Math.random() - 0.5);
      
      setQueueContextList(album.name, shuffled, shuffled[0]);
      loadTrack(shuffled[0]);
      
      shuffle = true;
      shuffleBtn.classList.add("active");
    };
  }

  const albumIndices = album.tracks.map((item) => item.index);

  album.tracks.forEach(({ track, index }, albumIndex) => {
    const button = document.createElement("div");
    button.className = `album-song-row${index === currentIndex ? " active" : ""}`;
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.setAttribute("aria-label", `Play ${track.title}`);

    button.addEventListener("click", (event) => {
      if (!event.target.closest(".track-options-btn")) {
        setQueueContextList(album.name, albumIndices, index);
        loadTrack(index);
      }
    });

    button.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
        event.preventDefault();
        setQueueContextList(album.name, albumIndices, index);
        loadTrack(index);
      }
    });

    const isCurrent = (index === currentIndex);
    const number = document.createElement("span");
    number.className = isCurrent ? "song-number active-playing" : "song-number";
    if (isCurrent) {
      number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
    } else {
      number.textContent = albumIndex + 1;
    }

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    copy.append(title);

    const optionsBtn = document.createElement("button");
    optionsBtn.className = "track-options-btn";
    optionsBtn.type = "button";
    optionsBtn.setAttribute("title", "Options");
    optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
    optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
    optionsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openTrackDropdown(track, optionsBtn, "album");
    });

    button.append(number, copy, optionsBtn);
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
  const favoriteIndices = favoriteTracks.map((item) => item.index);

  favoritesDetailMeta.textContent = `${favoriteTracks.length} ${favoriteTracks.length === 1 ? "song" : "songs"}`;
  if (favoritesDetailDescription) {
    favoritesDetailDescription.textContent = "Your liked songs from across the library, gathered into one quick-access collection.";
  }
  renderFavoritesArtwork(favoritesDetailArt, favoriteTracks);

  const playFavsBtn = document.querySelector("#playFavoritesBtn");
  if (playFavsBtn) {
    playFavsBtn.onclick = () => {
      if (!favoriteIndices.length) return;
      setQueueContextList("Liked Songs", favoriteIndices, favoriteIndices[0]);
      loadTrack(favoriteIndices[0]);
    };
  }

  const shufflePlayFavsBtn = document.querySelector("#shufflePlayFavoritesBtn");
  if (shufflePlayFavsBtn) {
    shufflePlayFavsBtn.onclick = () => {
      if (!favoriteIndices.length) return;
      const shuffled = [...favoriteIndices].sort(() => Math.random() - 0.5);
      
      setQueueContextList("Liked Songs", shuffled, shuffled[0]);
      loadTrack(shuffled[0]);
      
      shuffle = true;
      shuffleBtn.classList.add("active");
    };
  }

  if (!favoriteTracks.length) {
    favoritesSongList.innerHTML = '<div class="home-empty">No favorites yet. Tap the heart on a song to save it.</div>';
    return;
  }

  favoriteTracks.forEach(({ track, index }, favoriteIndex) => {
    const button = document.createElement("div");
    button.className = `album-song-row${index === currentIndex ? " active" : ""}`;
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.setAttribute("aria-label", `Play ${track.title}`);
    
    button.addEventListener("click", (event) => {
      if (!event.target.closest(".track-options-btn")) {
        setQueueContextList("favorites", favoriteIndices, index);
        loadTrack(index);
      }
    });

    button.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".track-options-btn")) {
        event.preventDefault();
        setQueueContextList("favorites", favoriteIndices, index);
        loadTrack(index);
      }
    });

    const isCurrent = (index === currentIndex);
    const number = document.createElement("span");
    number.className = isCurrent ? "song-number active-playing" : "song-number";
    if (isCurrent) {
      number.innerHTML = '<div class="playing-indicator"><span></span><span></span><span></span><span></span></div>';
    } else {
      number.textContent = favoriteIndex + 1;
    }

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = track.title;
    const meta = document.createElement("span");
    meta.textContent = track.album || "";
    if (track.album) {
      copy.append(title, meta);
    } else {
      copy.append(title);
    }

    const optionsBtn = document.createElement("button");
    optionsBtn.className = "track-options-btn";
    optionsBtn.type = "button";
    optionsBtn.setAttribute("title", "Options");
    optionsBtn.setAttribute("aria-label", `Options for ${track.title}`);
    optionsBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
    optionsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openTrackDropdown(track, optionsBtn, "favorites");
    });

    button.append(number, copy, optionsBtn);
    favoritesSongList.append(button);
  });
}

async function collectGithubAudio(owner, repo, branch, path) {
  const encodedPath = path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`);
  if (branch) url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    let message = "";
    try { const data = await response.json(); message = data?.message || ""; } catch {}
    if (response.status === 404) throw new Error("Repository or folder was not found.");
    if (response.status === 401) throw new Error("GitHub refused access. Check the repo and token.");
    if (response.status === 403 && /rate limit/i.test(message)) throw new Error("GitHub API rate limit exceeded. Try again later.");
    if (response.status === 403) throw new Error("GitHub refused access. Try again later.");
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
    let message = "";
    try { const data = await response.json(); message = data?.message || ""; } catch {}
    if (response.status === 404) throw new Error("Repository or folder was not found.");
    if (response.status === 401) throw new Error("GitHub refused access. Check the repo and token.");
    if (response.status === 403 && /rate limit/i.test(message)) throw new Error("GitHub API rate limit exceeded. Try again later.");
    if (response.status === 403) throw new Error("GitHub refused access. Try again later.");
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
  const cacheKey = `${owner}/${repo}::${branch || "default"}::${path || "/"}`;

  githubLoadBtn.disabled = true;
  githubStatus.textContent = `Looking through ${albumName}...`;

  try {
    const cacheAtStart = readGithubCache();
    const cached = cacheAtStart[cacheKey];
    const now = Date.now();
    if (cached && cached.tracks && now - (cached.ts || 0) < githubCacheMaxAgeMs) {
      const cachedTracks = cached.tracks.map((item) => ({
        ...item,
        id: makeId()
      }));
      const alreadyLoaded = tracks.some((t) => t.source === "github" && t.repo === cached.repoName);
      if (!alreadyLoaded) {
        tracks = [...tracks, ...cachedTracks];
        if (currentIndex === -1 && !sourceConfig.deferInitialLoad) loadTrack(0, false);
        renderPlaylist();
        renderHome();
      }
      refreshQueueToggleVisibility();
      githubStatus.textContent = `Loaded ${cachedTracks.length} tracks for ${albumName} (cached).`;
      return cachedTracks.length;
    }

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
    refreshQueueToggleVisibility();
    githubStatus.textContent = `Added ${audioItems.length} ${audioItems.length === 1 ? "track" : "tracks"} from ${repoName}.`;

    const cacheToWrite = readGithubCache();
    cacheToWrite[cacheKey] = { ts: Date.now(), repoName, albumName, tracks: newTracks.map(({ id, ...rest }) => rest) };
    writeGithubCache(cacheToWrite);
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
    refreshQueueToggleVisibility();
  } else {
    libraryStatus.textContent = failures.length ? failures.join(" | ") : "No audio files found in the GitHub albums.";
    githubStatus.textContent = libraryStatus.textContent;
    refreshQueueToggleVisibility();
  }
}

function shuffleAllAlbums() {
  if (!tracks.length) return;
  shuffle = true;
  setQueueContextRepo("all");
  shuffleQueueIndices = shuffledIndices(tracks.map((track, index) => ({ track, index })));
  shuffleQueueMode = "all";
  shuffleBtn.classList.add("active");
  renderPlaylist();
  loadTrack(shuffleQueueIndices[0]);
}

function isMobileViewport() { return window.matchMedia("(max-width: 900px)").matches; }

function collapseMobilePlayer() {
  if (isMobileViewport()) document.body.classList.remove("player-fullscreen");
  if (isMobileViewport()) document.body.classList.add("player-collapsed");
  if (isMobileViewport() && lyricsOpen) closeLyricsPanel();
  positionFullscreenActionRow();
  updatePlayerActionPlacement();
}

function expandMobilePlayer() {
  if (isMobileViewport()) document.body.classList.remove("player-collapsed");
  positionFullscreenActionRow();
  updatePlayerActionPlacement();
}

fileInput.addEventListener("change", (event) => addFiles(event.target.files));

playBtn.addEventListener("click", () => {
  if (audio.paused) playAudio();
  else pauseAudio();
});

prevBtn.addEventListener("click", previousTrack);
nextBtn.addEventListener("click", nextTrack);
shuffleAllBtn.addEventListener("click", shuffleAllAlbums);
const createPlaylistBtn = document.querySelector("#createPlaylistBtn");
if (createPlaylistBtn) {
  createPlaylistBtn.addEventListener("click", () => openPlaylistModal("create"));
}
if (closeAlbumDetailBtn) closeAlbumDetailBtn.addEventListener("click", closeDetailWindow);
if (closeFavoritesDetailBtn) closeFavoritesDetailBtn.addEventListener("click", closeDetailWindow);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  if (shuffle) { buildAlbumShuffleQueue(); } else { shuffleQueueIndices = []; shuffleQueueMode = ""; }
  shuffleBtn.classList.toggle("active", shuffle);
  renderPlaylist();
});

favoriteBtn.addEventListener("click", () => toggleFavorite(tracks[currentIndex]));
if (lyricsBtn) lyricsBtn.addEventListener("click", toggleLyricsPanel);
if (closeLyricsBtn) closeLyricsBtn.addEventListener("click", closeLyricsPanel);

repeatBtn.addEventListener("click", () => {
  if (repeat === "off") {
    repeat = "all";
    repeatBtn.classList.add("active");
    repeatBtn.classList.remove("repeat-one");
    repeatBtn.setAttribute("title", "Repeat All");
    repeatBtn.setAttribute("aria-label", "Repeat All");
  } else if (repeat === "all") {
    repeat = "one";
    repeatBtn.classList.add("active", "repeat-one");
    repeatBtn.setAttribute("title", "Repeat One");
    repeatBtn.setAttribute("aria-label", "Repeat One");
  } else {
    repeat = "off";
    repeatBtn.classList.remove("active", "repeat-one");
    repeatBtn.setAttribute("title", "Repeat Off");
    repeatBtn.setAttribute("aria-label", "Repeat Off");
  }
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.classList.toggle("active", audio.muted);
  updateVolumeSlider();
});

function setQueueOpen(open) {
  document.body.classList.toggle("queue-open", Boolean(open));
  if (queueToggleBtn) {
    queueToggleBtn.setAttribute("aria-label", open ? "Close queue" : "Open queue");
    queueToggleBtn.setAttribute("title", open ? "Close queue" : "Queue");
    queueToggleBtn.classList.toggle("active", Boolean(open));
  }
}

function refreshQueueToggleVisibility() {
  if (!queueToggleBtn) return;
  const show = isMobileViewport()
    && (document.body.classList.contains("has-track") || tracks.length > 0)
    && document.body.classList.contains("player-fullscreen");
  queueToggleBtn.hidden = !show;
  positionQueueToggleButton();
}

function positionQueueToggleButton() {
  if (!queueToggleBtn) return;
  if (!isMobileViewport()) return;
  if (!document.body.classList.contains("player-fullscreen")) return;
  if (fullActionsLeft && queueToggleBtn.parentElement !== fullActionsLeft) {
    fullActionsLeft.appendChild(queueToggleBtn);
  }
}

function updatePlayerActionPlacement() {
  positionFavoriteButton();
  positionMuteButton();
  positionQueueToggleButton();
  positionLyricsButton();
  updateLyricsButtonState();
}

function positionFullscreenActionRow() {
  if (!fullActionsRow) return;
  const show = isMobileViewport() && document.body.classList.contains("player-fullscreen");
  fullActionsRow.hidden = !show;
}

function updateTitleMarquee() {
  const container = document.querySelector(".track-title-container");
  const title = document.querySelector("#trackTitle");
  if (!container || !title) return;

  title.classList.remove("marquee-active");
  container.classList.remove("marquee-active-container");
  title.style.removeProperty("--overflow-width");

  const containerWidth = container.clientWidth;
  const titleWidth = title.scrollWidth;

  if (titleWidth > containerWidth) {
    const overflow = titleWidth - containerWidth;
    title.style.setProperty("--overflow-width", `${overflow + 24}px`);
    title.classList.add("marquee-active");
    container.classList.add("marquee-active-container");
  }
}

function openFullscreenPlayer() {
  if (!isMobileViewport()) return;
  document.body.classList.add("player-fullscreen");
  document.body.classList.remove("player-collapsed");
  positionFullscreenActionRow();
  updatePlayerActionPlacement();
  refreshQueueToggleVisibility();
  triggerVisualizer();
  setTimeout(updateTitleMarquee, 100);
  setTimeout(updateTitleMarquee, 500);
  updateLyricsSync(true);
}

function closeFullscreenPlayer() {
  if (!isMobileViewport()) return;
  document.body.classList.remove("player-fullscreen");
  document.body.classList.add("player-collapsed");
  if (lyricsOpen) closeLyricsPanel();
  positionFullscreenActionRow();
  updatePlayerActionPlacement();
  refreshQueueToggleVisibility();
  setTimeout(updateTitleMarquee, 100);
  setTimeout(updateTitleMarquee, 500);
  updateLyricsSync(true);
}

if (queueToggleBtn) {
  queueToggleBtn.addEventListener("click", () => {
    if (!isMobileViewport()) return;
    setQueueOpen(!document.body.classList.contains("queue-open"));
  });
}

let queueSwipeActive = false;

queueEl.addEventListener("touchstart", (event) => {
  if (event.target.closest('.queue-drag-handle, .queue-head')) {
    queueSwipeActive = true;
    swipeStartY = event.touches[0].clientY;
  } else {
    queueSwipeActive = false;
  }
}, { passive: true });

queueEl.addEventListener("touchend", (event) => {
  if (!queueSwipeActive) return;
  const endY = event.changedTouches[0].clientY;
  if (endY - swipeStartY > 55 && window.matchMedia("(max-width: 900px)").matches) {
    setQueueOpen(false);
  }
  queueSwipeActive = false;
}, { passive: true });

document.addEventListener("click", (event) => {
  if (!isMobileViewport()) return;
  if (playerEl.contains(event.target) || queueEl.contains(event.target)) return;

  if (document.body.classList.contains("queue-open")) {
    setQueueOpen(false);
    if (document.body.classList.contains("player-fullscreen")) return;
  }

  collapseMobilePlayer();
});

playerEl.addEventListener("click", (event) => {
  if (!isMobileViewport()) return;
  if (!document.body.classList.contains("player-collapsed")) return;
  if (event.target && event.target.closest && event.target.closest("button, input, a, label")) return;
  openFullscreenPlayer();
});

if (playerMinimizeBtn) {
  playerMinimizeBtn.addEventListener("click", () => {
    closeFullscreenPlayer();
    setQueueOpen(false);
  });
}

window.addEventListener("scroll", () => {
  if (!isMobileViewport()) return;
  if (Math.abs(window.scrollY - lastScrollY) > 8) { collapseMobilePlayer(); }
  lastScrollY = window.scrollY;
}, { passive: true });

window.addEventListener("resize", () => {
  updatePlayerActionPlacement();
  refreshQueueToggleVisibility();
  positionFullscreenActionRow();
  if (!isMobileViewport()) document.body.classList.remove("player-fullscreen");
  triggerVisualizer();
});


githubForm.addEventListener("submit", loadGithubRepository);

if (volume) {
  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = audio.volume === 0;
    muteBtn.classList.toggle("active", audio.muted);
    updateVolumeSlider();
  });
}

seek.addEventListener("input", () => {
  isSeeking = true;
  const time = (Number(seek.value) / 1000) * (audio.duration || 0);
  currentTimeEl.textContent = formatTime(time);
  updateSeekProgress();
});

seek.addEventListener("change", () => {
  audio.currentTime = (Number(seek.value) / 1000) * (audio.duration || 0);
  isSeeking = false;
  setMediaPositionState();
  updateSeekProgress();
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
  updateSeekProgress();
});

audio.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seek.value = audio.duration ? String((audio.currentTime / audio.duration) * 1000) : "0";
    currentTimeEl.textContent = formatTime(audio.currentTime);
    updateSeekProgress();
    const miniProgressBar = document.querySelector("#miniProgressBar");
    if (miniProgressBar) {
      miniProgressBar.style.width = `${percent}%`;
    }
  }
  updateLyricsSync();
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
  if (repeat === "one") {
    audio.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, button")) {
    if (event.code === "Escape") {
      event.target.blur();
      closeDetailWindow();
      closePlaylistPicker();
      closeLyricsPanel();
      if (searchPanel) searchPanel.hidden = true;
    }
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    audio.paused ? playAudio() : pauseAudio();
  }
  if (event.code === "ArrowRight") audio.currentTime = Math.min((audio.currentTime || 0) + 5, audio.duration || 0);
  if (event.code === "ArrowLeft") audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
  if (event.code === "Escape") {
    closeDetailWindow();
    closePlaylistPicker();
    closeLyricsPanel();
    if (searchPanel) searchPanel.hidden = true;
  }
  if (event.code === "ArrowUp") {
    event.preventDefault();
    audio.volume = Math.min((audio.volume || 0) + 0.05, 1);
    if (volume) volume.value = audio.volume;
    audio.muted = false;
    muteBtn.classList.remove("active");
  }
  if (event.code === "ArrowDown") {
    event.preventDefault();
    audio.volume = Math.max((audio.volume || 0) - 0.05, 0);
    if (volume) volume.value = audio.volume;
    audio.muted = audio.volume === 0;
    muteBtn.classList.toggle("active", audio.muted);
  }
  if (event.code === "KeyM") {
    audio.muted = !audio.muted;
    muteBtn.classList.toggle("active", audio.muted);
  }
  if (event.code === "KeyL") {
    toggleLyricsPanel();
  }
  if (event.code === "KeyF") {
    toggleFavorite(tracks[currentIndex]);
  }
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

let playlistModalAction = "create";
let playlistModalTargetName = "";

function openPlaylistModal(action, targetName = "") {
  playlistModalAction = action;
  playlistModalTargetName = targetName;
  
  const modal = document.querySelector("#playlistModal");
  const eyebrow = document.querySelector("#playlistModalEyebrow");
  const title = document.querySelector("#playlistModalTitle");
  const input = document.querySelector("#playlistModalInput");
  const submitBtn = document.querySelector("#playlistModalSubmitBtn");
  
  if (!modal || !input) return;
  
  if (action === "create") {
    if (eyebrow) eyebrow.textContent = "New Playlist";
    if (title) title.textContent = "Create Playlist";
    if (submitBtn) submitBtn.textContent = "Confirm";
    input.value = "";
    input.placeholder = "Playlist Name";
  } else if (action === "rename") {
    if (eyebrow) eyebrow.textContent = "Manage Playlist";
    if (title) title.textContent = "Rename Playlist";
    if (submitBtn) submitBtn.textContent = "Rename";
    input.value = targetName;
    input.placeholder = "New Playlist Name";
  } else if (action === "saveDailyMix") {
    if (eyebrow) eyebrow.textContent = "Save Daily Mix";
    if (title) title.textContent = "Save to My Playlists";
    if (submitBtn) submitBtn.textContent = "Save";
    input.value = `${targetName} (Saved)`;
    input.placeholder = "Playlist Name";
  } else if (action === "createAndAdd") {
    if (eyebrow) eyebrow.textContent = "New Playlist";
    if (title) title.textContent = "Create & Add Track";
    if (submitBtn) submitBtn.textContent = "Create";
    input.value = "";
    input.placeholder = "Playlist Name";
  }
  
  modal.hidden = false;
  document.body.classList.add("picker-open");
  
  setTimeout(() => {
    input.focus();
    input.select();
  }, 50);
}

function closePlaylistModal() {
  const modal = document.querySelector("#playlistModal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("picker-open");
  const input = document.querySelector("#playlistModalInput");
  if (input) input.value = "";
}

function openAboutModal() {
  const modal = document.querySelector("#aboutModal");
  if (modal) modal.hidden = false;
}

function closeAboutModal() {
  const modal = document.querySelector("#aboutModal");
  if (modal) modal.hidden = true;
}

window.openAboutModal = openAboutModal;
window.closeAboutModal = closeAboutModal;

function handlePlaylistModalSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#playlistModalInput");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  
  if (playlistModalAction === "create") {
    createPlaylist(val);
  } else if (playlistModalAction === "rename") {
    renamePlaylist(playlistModalTargetName, val);
  } else if (playlistModalAction === "saveDailyMix") {
    const tracksInMix = dailyMixes[playlistModalTargetName] || [];
    createPlaylist(val, tracksInMix);
  } else if (playlistModalAction === "createAndAdd") {
    createPlaylist(val, [playlistModalTargetName]);
    closePlaylistPicker();
  }
  closePlaylistModal();
}

function renamePlaylist(oldName, newName) {
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();
  if (!trimmedOld || !trimmedNew) return;
  if (trimmedOld === trimmedNew) return;
  if (customPlaylists[trimmedNew]) {
    showToast("A playlist with that name already exists.", "error");
    return;
  }

  customPlaylists[trimmedNew] = customPlaylists[trimmedOld];
  delete customPlaylists[trimmedOld];

  if (selectedPlaylistName === trimmedOld) {
    selectedPlaylistName = trimmedNew;
  }
  saveCustomPlaylists();
  showToast(`Renamed to "${trimmedNew}"`, "success");
  renderHome();
}

window.openPlaylistModal = openPlaylistModal;
window.closePlaylistModal = closePlaylistModal;
window.handlePlaylistModalSubmit = handlePlaylistModalSubmit;

function createPlaylist(name, trackKeys = []) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (customPlaylists[trimmed]) {
    showToast("A playlist with that name already exists.", "error");
    return;
  }
  customPlaylists[trimmed] = [...trackKeys];
  saveCustomPlaylists();
  showToast(trackKeys.length ? `Saved as playlist "${trimmed}"!` : `Playlist "${trimmed}" created!`, "success");
  renderHome();
}

function openPlaylistPicker(track) {
  const picker = document.querySelector("#playlistPickerPanel");
  const pickerList = document.querySelector("#pickerList");
  const pickerTitle = document.querySelector("#pickerTrackTitle");
  if (!picker || !pickerList || !pickerTitle) return;

  activeTrackForPlaylistSelection = track;
  const playlistNames = Object.keys(customPlaylists);

  pickerTitle.textContent = track.title;
  pickerList.innerHTML = "";

  // "+ Create New Playlist" item at the top of the list
  const createItem = document.createElement("button");
  createItem.type = "button";
  createItem.className = "picker-item";
  createItem.style.border = "1px dashed var(--line)";
  createItem.style.background = "rgba(255, 255, 255, 0.02)";
  createItem.innerHTML = `
    <span class="picker-item-art" style="background: linear-gradient(135deg, var(--rose), var(--amber)); display: grid; place-items: center; color: var(--ink); font-weight: 900; font-size: 1.25rem;">+</span>
    <span class="picker-item-copy">
      <strong>Create New Playlist</strong>
      <small>Create and add track directly</small>
    </span>
  `;
  createItem.addEventListener("click", () => {
    openPlaylistModal("createAndAdd", activeTrackForPlaylistSelection.key);
  });
  pickerList.append(createItem);

  playlistNames.forEach((pName) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "picker-item";
    
    const art = document.createElement("span");
    art.className = "picker-item-art";
    renderPlaylistArt(art, customPlaylists[pName]);

    const copy = document.createElement("span");
    copy.className = "picker-item-copy";
    copy.innerHTML = `
      <strong>${pName}</strong>
      <small>${customPlaylists[pName].length} tracks</small>
    `;

    item.append(art, copy);
    item.addEventListener("click", () => {
      addTrackToPlaylist(activeTrackForPlaylistSelection.key, pName);
      closePlaylistPicker();
    });
    pickerList.append(item);
  });

  picker.hidden = false;
  document.body.classList.add("picker-open"); 
}

function closePlaylistPicker() {
  const picker = document.querySelector("#playlistPickerPanel");
  if (picker) picker.hidden = true;
  activeTrackForPlaylistSelection = null;
  document.body.classList.remove("picker-open");
}

function addTrackToPlaylist(trackKey, playlistName) {
  if (!customPlaylists[playlistName]) return;
  if (!customPlaylists[playlistName].includes(trackKey)) {
    customPlaylists[playlistName].push(trackKey);
    saveCustomPlaylists();
    showToast(`Added to ${playlistName}!`, "success");
    renderHome();
  } else {
    showToast("Already in this playlist.", "info");
  }
}

function removeTrackFromPlaylist(trackKey, playlistName) {
  if (!customPlaylists[playlistName]) return;
  customPlaylists[playlistName] = customPlaylists[playlistName].filter(k => k !== trackKey);
  saveCustomPlaylists();
  renderHome();
}

async function deletePlaylist(playlistName) {
  const confirmed = await showConfirm(`Delete "${playlistName}"? This cannot be undone.`, "Delete Playlist");
  if (confirmed) {
    delete customPlaylists[playlistName];
    if (selectedPlaylistName === playlistName) selectedPlaylistName = "";
    saveCustomPlaylists();
    showToast(`Deleted "${playlistName}"`, "error");
    renderHome();
  }
}

function updateVolumeSlider() {
  if (!volume) return;
  const percent = audio.muted ? 0 : audio.volume * 100;
  volume.value = audio.muted ? 0 : audio.volume;
  volume.style.background = `linear-gradient(to right, var(--mint) 0%, var(--mint) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`;
}

renderPlaylist();
renderHome();
updateVolumeSlider();
loadDefaultGithubAlbums();
updatePlayerActionPlacement();
refreshQueueToggleVisibility();
positionFullscreenActionRow();

const aboutBtn = document.querySelector("#aboutBtn");
const mobileAboutBtn = document.querySelector("#mobileAboutBtn");
if (aboutBtn) aboutBtn.addEventListener("click", openAboutModal);
if (mobileAboutBtn) mobileAboutBtn.addEventListener("click", openAboutModal);

window.addEventListener("resize", updateTitleMarquee);

const lyricsTickerEl = document.querySelector("#lyricsTicker");
if (lyricsTickerEl) {
  lyricsTickerEl.addEventListener("click", () => {
    openLyricsPanel();
  });
}

// Blur clicked buttons globally to prevent browser double-firing Spacebar inputs
document.addEventListener("click", (event) => {
  if (event.target && event.target.closest) {
    const button = event.target.closest("button");
    if (button) button.blur();
  }
});

// Close search suggestions panel dropdown when clicking outside it
document.addEventListener("click", (event) => {
  if (searchPanel && !searchPanel.hidden && searchInput && !searchInput.contains(event.target) && !searchPanel.contains(event.target)) {
    searchPanel.hidden = true;
  }
});

// Close playlist options dropdown when clicking outside it
document.addEventListener("click", (event) => {
  const optionsDropdown = document.querySelector("#playlistOptionsDropdown");
  const optionsBtn = document.querySelector("#playlistOptionsBtn");
  if (optionsDropdown && !optionsDropdown.hidden && optionsBtn && !optionsBtn.contains(event.target) && !optionsDropdown.contains(event.target)) {
    optionsDropdown.hidden = true;
  }
});

// Close track options dropdown when clicking outside it
document.addEventListener("click", (event) => {
  const dropdown = document.querySelector("#trackDropdown");
  if (dropdown && !dropdown.hidden) {
    const isClickInside = dropdown.contains(event.target) || event.target.closest(".track-options-btn");
    if (!isClickInside) {
      closeTrackDropdown();
    }
  }
});

// Swipe down to close expanded fullscreen player on mobile devices
const playerContainer = document.querySelector(".player");
if (playerContainer) {
  playerContainer.addEventListener("touchstart", (event) => {
    if (!isMobileViewport()) return;
    if (document.body.classList.contains("player-collapsed")) return;
    if (event.target.closest("input[type='range'], #lyricsPanel, .playlist, button")) return;
    
    swipeStartY = event.touches[0].clientY;
    swipeStartX = event.touches[0].clientX;
    swipeTracking = true;
  }, { passive: true });

  playerContainer.addEventListener("touchend", (event) => {
    if (!swipeTracking) return;
    swipeTracking = false;
    
    const endY = event.changedTouches[0].clientY;
    const endX = event.changedTouches[0].clientX;
    const deltaY = endY - swipeStartY;
    const deltaX = Math.abs(endX - swipeStartX);
    
    if (deltaY > 70 && deltaY > deltaX) {
      closeFullscreenPlayer();
      setQueueOpen(false);
    }
  }, { passive: true });
}