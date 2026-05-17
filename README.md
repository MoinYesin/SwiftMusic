Swift Music 🎵

A modern web-based music streaming player inspired by premium music apps — built entirely with vanilla JavaScript, HTML, and CSS.

Swift Music supports:

- GitHub-hosted music libraries
- Album organization
- Favorites
- Queue management
- Shuffle & repeat
- Media session controls
- Mobile gestures
- Offline support (PWA)
- Local audio playback

Designed for smooth performance, responsive UI, and an immersive listening experience across desktop and mobile devices.

---

✨ Features

🎶 Music Playback

- Play MP3, WAV, OGG, M4A, FLAC and more
- Previous / Next controls
- Seekbar with live timestamps
- Volume & mute controls
- Shuffle mode
- Repeat mode

📚 Album System

- Automatic album grouping
- Album detail pages
- Album cover art detection
- Album-based queue system

❤️ Favorites

- Favorite songs with one tap
- Dedicated favorites section
- Persistent favorites using LocalStorage

📈 Most Played Tracking

- Tracks play counts automatically
- Dynamic “Most Played” section
- Persistent playback history

☁ GitHub Music Library

Load songs directly from GitHub repositories.

Supports:

- Public repositories
- Nested folders
- Cover image detection
- Multiple album sources
- Cached GitHub libraries

📱 Mobile Optimized

- Swipe-up queue gesture
- Collapsible mobile player
- Touch-friendly controls
- Responsive layout

🎧 Media Session API

Integrates with:

- Android media controls
- Notification controls
- Bluetooth headphones
- Lock screen controls

⚡ Progressive Web App (PWA)

- Installable on mobile and desktop
- Offline caching
- Service Worker support

---

🛠 Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages
- Media Session API
- Service Workers
- LocalStorage API

---

🚀 Live Demo

Add your GitHub Pages link here:

https://moinyesin.github.io/SwiftMusic/

---

📂 Project Structure

/
├── index.html
├── styles.css
├── app.js
├── sw.js
├── manifest.json
├── favicon.svg

---

⚙ Setup

Clone Repository

git clone https://github.com/yourusername/yourrepo.git

Run Locally

Simply open:

index.html

Or use VS Code Live Server.

---

🎵 Loading Music from GitHub

The player can automatically load songs from GitHub repositories.

Example repository format:

repo/
 ├── album1/
 │   ├── song1.mp3
 │   ├── song2.mp3
 │   └── cover.jpg

Supported image names:

- cover.jpg
- folder.png
- artwork.webp
- front.jpg

---

📦 PWA Installation

On supported browsers:

1. Open the website
2. Tap “Install App”
3. Enjoy native-like music playback

---

🧠 Caching System

The app uses a Service Worker for:

- Offline playback
- Faster loading
- Asset caching

When deploying updates:

- Update cache version inside "sw.js"

Example:

const CACHE = "taylor-stream-v2";

---

🔥 Features Planned

- Lyrics support
- Playlist creation
- Search system
- Cloud sync
- Drag & drop queue sorting

---

📸 Screenshots

Add screenshots here.

![Home](screenshots/home.png)
![Player](screenshots/player.png)

---

🤝 Contributing

Pull requests are welcome.

For major changes, please open an issue first to discuss what you would like to change.

---

📄 License

MIT License

---

👨‍💻 Developer

Made with ❤️ by Moin Yesin

Game Developer & MCA Student
