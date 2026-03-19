document.addEventListener('DOMContentLoaded', () => {
    // ===== MODERN NOTIFICATION FUNCTION (Toast) =====
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;


        notification.className = 'fixed top-20 right-5 p-4 rounded-lg text-white font-bold shadow-xl transform transition-all duration-500 ease-in-out z-[2000] opacity-0 translate-x-full';

        if (type === 'error') {
            notification.classList.add('bg-red-600');
        } else if (type === 'info') {
            notification.classList.add('bg-red-500');
        } else { // 'success'
            notification.classList.add('bg-green-500');
        }

        document.body.appendChild(notification);
        requestAnimationFrame(() => { notification.classList.remove('opacity-0', 'translate-x-full'); });

        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-full');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 2000);
    }

    // UI
    const musicToggle = document.getElementById('music-toggle');
    const musicPanel = document.getElementById('music-panel');
    const addMusicModal = document.getElementById('add-music-modal');
    const cancelMusicBtn = document.getElementById('cancel-music');
    const closeMusicBtn = document.getElementById('close-music');
    const openAddBtn = document.getElementById('open-add-music');
    const coverImg = document.getElementById("song-cover");
    const musicMenuBtn = document.getElementById('open-music-menu');
    const myLinks = document.getElementById('myLinks');

    if (musicMenuBtn) {
        if (localStorage.getItem('loggedUser')) {
            musicMenuBtn.style.display = 'block';
        }
        musicMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!localStorage.getItem('loggedUser')) {
                showNotification('Ehhez be kell jelentkezned!', 'info');
                return;
            }
            musicPanel.classList.remove('hidden');
            addMusicModal.classList.add('hidden');
        });
    }

    musicToggle?.addEventListener('click', () => {
        musicPanel.classList.toggle('hidden');
        addMusicModal.classList.add('hidden');
    });
    cancelMusicBtn?.addEventListener('click', () => addMusicModal.classList.add('hidden'));
    closeMusicBtn?.addEventListener('click', () => { musicPanel.classList.add('hidden'); addMusicModal.classList.add('hidden'); });
    openAddBtn?.addEventListener('click', () => {
      if (!localStorage.getItem('loggedUser')) {
        showNotification('Ehhez be kell jelentkezned!', 'info');
        return;
      }
      addMusicModal.classList.toggle('hidden');
    });

    // Elements
    const audio = document.getElementById('audio-player');
    audio.volume = 0.8;
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const addBtn = document.getElementById('add-music');
    const recommendBtn = document.getElementById('recommend-music');

    const urlInput = document.getElementById('music-url');
    const titleInput = document.getElementById('music-title');
    const moodInput = document.getElementById('music-mood');

    const titleText = document.getElementById('song-title');
    const artistText = document.getElementById('song-artist');
    const moodSelect = document.getElementById('mood-filter');
    const favBtn = document.getElementById('toggle-favorite');
    const delBtn = document.getElementById('delete-track');
    const favOnlyBtn = document.getElementById('toggle-favorites-only');
    const scIframe = document.getElementById('sc-player');
    let scWidget = null;
    
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    // State
    let playlist = [];
    let currentIndex = 0;
    let isPlaying = false;
    let mode = null; // 'audio' | 'youtube' | 'soundcloud'

    let favorites = new Set();
    let favoritesOnly = false;
    let fullPlaylistBackup = null;

    let library = [];
    let moodFilter = null;
    let moodPlaylistBackup = null;
    let isDraggingProgress = false;
    let scDuration = 0;

    // Helpers
    function getTrackKey(track) {
      if (!track) return '';
      if (track.type === 'youtube') return `youtube:${track.id}`;
      if (track.type === 'soundcloud') return `soundcloud:${track.url}`;
      return `audio:${track.url}`;
    }
    function loadFavorites() {
      try { const arr = JSON.parse(localStorage.getItem('stormy_favorites') || '[]'); favorites = new Set(Array.isArray(arr) ? arr : []); }
      catch { favorites = new Set(); }
    }
    function saveFavorites() {
      try { localStorage.setItem('stormy_favorites', JSON.stringify(Array.from(favorites))); } catch {}
    }
    function isFavorite(track) { return favorites.has(getTrackKey(track)); }
    function updateFavoriteButton() {
      const song = playlist[currentIndex];
      favBtn.textContent = song && isFavorite(song) ? '❤️' : '🤍';
    }
    function loadLibrary() {
      try { const arr = JSON.parse(localStorage.getItem('stormy_library') || '[]'); library = Array.isArray(arr) ? arr : []; }
      catch { library = []; }
    }
    function saveLibrary() { try { localStorage.setItem('stormy_library', JSON.stringify(library)); } catch {} }

    // Recommendations
    const RECOMMENDATIONS = {
      clear: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Napos Dallam (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', title: 'Vidám Reggel (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Fényes Nap (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', title: 'Nyári Szellő (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', title: 'Boldogság (SoundHelix)' }
      ],
      clouds: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Borús Égbolt (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', title: 'Szürke Árnyalatok (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', title: 'Melankólia (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', title: 'Gondolatok (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Csendes Pihenő (SoundHelix)' }
      ],
      rain: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', title: 'Esőcseppek (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', title: 'Zivatar Után (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', title: 'Vizes Ablak (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Kopogó Eső (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', title: 'Novemberi Eső (SoundHelix)' }
      ],
      thunder: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', title: 'Viharos Erő (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', title: 'Villámlás (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', title: 'Dörgés (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Elektromosság (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', title: 'Feszültség (SoundHelix)' }
      ],
      snow: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', title: 'Havas Táj (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Téli Álom (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', title: 'Jégvirág (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', title: 'Hideg Érintés (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Fehér Karácsony (SoundHelix)' }
      ],
      mist: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', title: 'Ködös Hajnal (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Homály (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Rejtély (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', title: 'Pára (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', title: 'Láthatatlan (SoundHelix)' }
      ],
      wind: [
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Szeles Idő (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', title: 'Tornádó (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Orkán (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', title: 'Szélvihar (SoundHelix)' },
        { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', title: 'Süvítő Szél (SoundHelix)' }
      ]
    };

    function getCurrentMood() {
      // 1. Próbáljuk meg a globális dailyWeather változót használni (index.js-ből)
      // Ez biztosítja, hogy mindig az aktuálisan keresett város időjárását vegyük alapul.
      if (typeof dailyWeather !== 'undefined' && dailyWeather && dailyWeather.weather && dailyWeather.weather[0]) {
        const id = dailyWeather.weather[0].id;
        // Weather codes: https://openweathermap.org/weather-conditions
        if (id >= 200 && id < 300) return 'thunder';
        if (id >= 300 && id < 600) return 'rain';
        if (id >= 600 && id < 700) return 'snow';
        if (id >= 700 && id < 800) return 'mist';
        if (id === 800) return 'clear';
        if (id > 800) return 'clouds';
      }

      // 2. Fallback: DOM elem alapján (ha a globális változó nem elérhető)
      const weatherEl = document.getElementById('weather-description');
      if (!weatherEl) {
        return 'clear'; // Alapértelmezett, ha az elem nem található
      }
      const t = weatherEl.textContent.toLowerCase();

      if (t.includes('tiszta') || t.includes('derült') || t.includes('napos')) return 'clear';
      if (t.includes('felhő') || t.includes('borús')) return 'clouds';
      if (t.includes('eső') || t.includes('zápor') || t.includes('szitálás')) return 'rain';
      if (t.includes('zivatar') || t.includes('vihar') || t.includes('mennydörgés')) return 'thunder';
      if (t.includes('hó') || t.includes('havazás')) return 'snow';
      if (t.includes('köd') || t.includes('pára') || t.includes('szmog') || t.includes('hamu') || t.includes('füst')) return 'mist';
      if (t.includes('szél') || t.includes('viharos') || t.includes('szeles')) return 'wind';
      return 'clear'; // Alapértelmezett hangulat
    }
    function recommendByWeather() {
      const mood = getCurrentMood();
      const list = RECOMMENDATIONS[mood] || [];
      playlist = list.map(item => item.type === 'youtube' ? { type: 'youtube', id: item.id, title: item.title } : { type: 'audio', url: item.url, title: item.title });
      try { localStorage.setItem('stormy_playlist', JSON.stringify(playlist)); } catch {}
      currentIndex = 0;
      if (playlist.length) loadSong(0, true); else { titleText.textContent = 'Nincs dal'; artistText.textContent = ''; audio.src=''; updateFavoriteButton(); }
    }

    // Mood filter
    function applyMoodFilter(mood) {
      if (!mood) {
        moodFilter = null;
        if (moodPlaylistBackup) { playlist = moodPlaylistBackup.slice(); moodPlaylistBackup = null; }
        currentIndex = 0;
        if (playlist.length) loadSong(0, false); else { titleText.textContent = 'Nincs dal'; artistText.textContent=''; try { audio.pause(); } catch {}; audio.src=''; updateFavoriteButton(); }
        try { localStorage.setItem('stormy_playlist', JSON.stringify(playlist)); } catch {}
        return;
      }
      if (!moodPlaylistBackup) moodPlaylistBackup = playlist.slice();
      moodFilter = mood;
      let filtered = library.filter(t => (t.mood || '') === mood);
      if (favoritesOnly) filtered = filtered.filter(t => isFavorite(t));
      playlist = filtered;
      currentIndex = 0;
      if (playlist.length) loadSong(0, false); else { titleText.textContent = 'Nincs dal'; artistText.textContent=''; try { audio.pause(); } catch {}; audio.src=''; updateFavoriteButton(); }
      try { localStorage.setItem('stormy_playlist', JSON.stringify(playlist)); } catch {}
    }

    // Players
    let ytPlayer = null; let pendingVideoId = null; let ytPlayRetryTimer = null; let ytPendingPlay = false;
    function extractVideoId(url) {
      try {
        const u = new URL(url);
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        const parts = u.pathname.split('/').filter(Boolean);
        if (u.hostname.includes('youtu.be')) return parts[0] || null;
        const iS = parts.indexOf('shorts'); if (iS !== -1) return parts[iS+1] || null;
        const iE = parts.indexOf('embed'); if (iE !== -1) return parts[iE+1] || null;
      } catch(e) { const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/); if (m) return m[1]; }
      return null;
    }
    window.onYouTubeIframeAPIReady = () => {
      ytPlayer = new YT.Player('yt-player', {
        height: '180', width: '320', playerVars: { controls: 1 },
        events: {
          onReady: () => { try { ytPlayer.unMute(); ytPlayer.setVolume(80); } catch {} if (pendingVideoId) { ytPlayer.cueVideoById(pendingVideoId); pendingVideoId = null; } if (ytPendingPlay) { ytPendingPlay = false; try { ytPlayer.playVideo(); } catch {} } },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) { isPlaying = true; playPauseBtn.querySelector('img').src = 'images/icons/pause.svg'; }
            else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.CUED) { isPlaying = false; playPauseBtn.querySelector('img').src = 'images/icons/play.svg'; }
            else if (e.data === YT.PlayerState.ENDED) { nextBtn?.click(); }
          }
        }
      });
    };

    // Biztosítjuk, hogy ha a YouTube API előbb töltődött be, akkor is inicializáljuk
    if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
    }

    // Progress Helpers
    const formatTime = (s) => {
      if (!s || isNaN(s) || !isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    function loadSong(index, autoPlay = false) {
      const song = playlist[index]; if (!song) return;
      isPlaying = false; playPauseBtn.querySelector('img').src = 'images/icons/play.svg';
      titleText.textContent = song.title; artistText.textContent = 'Felhasználó'; updateFavoriteButton();
      coverImg.src = song.cover || "images/icons/profil.svg";
      if (song.type === 'soundcloud') {
        mode = 'soundcloud'; try { ytPlayer?.pauseVideo?.(); } catch {}; try { audio.pause(); } catch {}; audio.src = '';
        const playerUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.url)}&auto_play=${autoPlay ? 'true' : 'false'}`;
        if (scIframe) {
          scIframe.src = playerUrl;
          if (!scWidget && window.SC && window.SC.Widget) {
            scWidget = SC.Widget(scIframe);
            try {
              scWidget.bind(SC.Widget.Events.PLAY, () => { isPlaying = true; playPauseBtn.querySelector('img').src = 'images/icons/pause.svg'; });
              scWidget.bind(SC.Widget.Events.PAUSE, () => { isPlaying = false; playPauseBtn.querySelector('img').src = 'images/icons/play.svg'; });
              scWidget.bind(SC.Widget.Events.FINISH, () => { nextBtn?.click(); });
              scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
                if (mode !== 'soundcloud' || isDraggingProgress) return;
                // data.currentPosition is ms, relativePosition is 0-1
                if (scDuration) { progressBar.value = data.relativePosition * 100; currentTimeEl.textContent = formatTime(data.currentPosition / 1000); durationEl.textContent = formatTime(scDuration / 1000); }
              });
              scWidget.bind(SC.Widget.Events.READY, () => { scWidget.getDuration(d => { scDuration = d; durationEl.textContent = formatTime(d / 1000); }); });
            } catch {}
          }
          if (scWidget && scWidget.load) { try { scWidget.load(song.url, { auto_play: autoPlay, show_comments: false, visual: false }); } catch {} }
        }
      } else if (song.type === 'youtube') {
        mode = 'youtube'; try { audio.pause(); } catch {}; audio.src = '';
        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
          ytPlayer.loadVideoById(song.id);
          if (autoPlay) { try { ytPlayer.unMute(); ytPlayer.setVolume(80); ytPlayer.playVideo(); } catch {} }
        } else { pendingVideoId = song.id; if (autoPlay) ytPendingPlay = true; }
      } else {
        mode = 'audio'; try { ytPlayer?.pauseVideo?.(); } catch {};
        audio.src = song.url; if (autoPlay) audio.play().catch(() => {});
      }
    }

    // Progress Bar Events
    progressBar?.addEventListener('input', () => { isDraggingProgress = true; });
    progressBar?.addEventListener('change', () => {
      isDraggingProgress = false;
      const percent = parseFloat(progressBar.value);
      if (mode === 'audio') {
        if (audio.duration) audio.currentTime = (percent / 100) * audio.duration;
      } else if (mode === 'youtube' && ytPlayer && ytPlayer.seekTo) {
        const dur = ytPlayer.getDuration();
        if (dur) ytPlayer.seekTo((percent / 100) * dur, true);
      } else if (mode === 'soundcloud' && scWidget) {
        if (scDuration) scWidget.seekTo((percent / 100) * scDuration);
      }
    });
    // YouTube Progress Polling
    setInterval(() => {
      if (mode === 'youtube' && isPlaying && !isDraggingProgress && ytPlayer && ytPlayer.getCurrentTime) {
        const curr = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur) { progressBar.value = (curr / dur) * 100; currentTimeEl.textContent = formatTime(curr); durationEl.textContent = formatTime(dur); }
      }
    }, 500);

    // Controls
    playPauseBtn.addEventListener('click', () => {
      if (!playlist.length) return;
      if (!isPlaying) {
        if (mode === 'youtube') {
          const tryNow = () => { if (ytPlayer && typeof ytPlayer.playVideo === 'function') { try { ytPlayer.unMute(); ytPlayer.setVolume(80); } catch {}; ytPlayer.playVideo(); return true; } return false; };
          if (!tryNow()) { ytPendingPlay = true; clearTimeout(ytPlayRetryTimer); ytPlayRetryTimer = setTimeout(() => { if (!tryNow()) { ytPlayRetryTimer = setTimeout(() => { tryNow(); }, 700); } }, 300); }
        } else if (mode === 'soundcloud') { try { scWidget && scWidget.play && scWidget.play(); } catch {} }
        else { audio.play(); }
      } else {
        if (mode === 'youtube') { try { ytPlayer?.pauseVideo?.(); } catch {} }
        else if (mode === 'soundcloud') { try { scWidget && scWidget.pause && scWidget.pause(); } catch {} }
        else { audio.pause(); }
      }
    });
    nextBtn?.addEventListener('click', () => { if (!playlist.length) return; currentIndex = (currentIndex + 1) % playlist.length; loadSong(currentIndex, true); });
    prevBtn?.addEventListener('click', () => { if (!playlist.length) return; currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; loadSong(currentIndex, true); });

    favBtn?.addEventListener('click', () => {
      if (!localStorage.getItem('loggedUser')) {
        showNotification('Ehhez be kell jelentkezned!', 'info');
        return;
      }
      const song = playlist[currentIndex]; if (!song) return; const key = getTrackKey(song); if (favorites.has(key)) favorites.delete(key); else favorites.add(key); saveFavorites(); updateFavoriteButton();
    });

    delBtn?.addEventListener('click', () => {
      if (!playlist.length) return;
      try { ytPlayer?.pauseVideo?.(); } catch {}; try { scWidget && scWidget.pause && scWidget.pause(); } catch {}; try { audio.pause(); } catch {};
      const removed = playlist.splice(currentIndex, 1)[0];
      try { localStorage.setItem('stormy_playlist', JSON.stringify(playlist)); } catch {};
      if (removed) { const rKey = getTrackKey(removed); const before = library.length; library = library.filter(t => getTrackKey(t) !== rKey); if (library.length !== before) saveLibrary(); }
      if (fullPlaylistBackup) { const key = getTrackKey(removed); fullPlaylistBackup = fullPlaylistBackup.filter(t => getTrackKey(t) !== key); }
      if (!playlist.length) { currentIndex = 0; titleText.textContent = 'Nincs dal'; artistText.textContent = ''; audio.src = ''; updateFavoriteButton(); return; }
      if (currentIndex >= playlist.length) currentIndex = 0; loadSong(currentIndex);
    });

    favOnlyBtn?.addEventListener('click', () => {
      favoritesOnly = !favoritesOnly;
      if (favoritesOnly) { fullPlaylistBackup = playlist.slice(); playlist = fullPlaylistBackup.filter(t => isFavorite(t)); currentIndex = 0; favOnlyBtn.textContent = 'Csak kedvencek: BE'; }
      else { if (fullPlaylistBackup) playlist = fullPlaylistBackup; fullPlaylistBackup = null; currentIndex = 0; favOnlyBtn.textContent = 'Csak kedvencek: KI'; }
      if (playlist.length) loadSong(0); else { titleText.textContent = 'Nincs dal'; artistText.textContent=''; audio.src=''; updateFavoriteButton(); }
    });

    audio.addEventListener('play', () => { isPlaying = true; playPauseBtn.querySelector('img').src = 'images/icons/pause.svg'; });
    audio.addEventListener('pause', () => { isPlaying = false; playPauseBtn.querySelector('img').src = 'images/icons/play.svg'; });
    audio.addEventListener('ended', () => { nextBtn?.click(); });
    audio.addEventListener('timeupdate', () => {
      if (mode === 'audio' && !isDraggingProgress && audio.duration) { progressBar.value = (audio.currentTime / audio.duration) * 100; currentTimeEl.textContent = formatTime(audio.currentTime); durationEl.textContent = formatTime(audio.duration); }
    });
    audio.addEventListener('loadedmetadata', () => { if (mode === 'audio') durationEl.textContent = formatTime(audio.duration); });

    // Add Music
    addBtn?.addEventListener('click', () => {
      const url = urlInput.value.trim(); const title = titleInput.value.trim(); const moodVal = (moodInput?.value || '').trim();
      if (!url || !title) { showNotification('A zene URL-jét és címét is meg kell adni!', 'error'); return; }
      let newTrack = null;
      if (/(youtube\.com|youtu\.be)/i.test(url)) { const videoId = extractVideoId(url); if (!videoId) { showNotification('Érvénytelen YouTube link!', 'error'); return; } newTrack = { type: 'youtube', id: videoId, title, mood: moodVal || undefined }; }
      else if (/(soundcloud\.com)/i.test(url)) { newTrack = { type: 'soundcloud', url, title, mood: moodVal || undefined }; }
      else { newTrack = { type: 'audio', url, title, mood: moodVal || undefined }; }
      library.push(newTrack); saveLibrary();
      if (moodFilter) { applyMoodFilter(moodFilter); } else {
        playlist.push(newTrack); try { localStorage.setItem('stormy_playlist', JSON.stringify(playlist)); } catch {};
        if (playlist.length === 1) { currentIndex = 0; loadSong(0, false); } // Auto-load if it's the first song
      }
      urlInput.value = ''; titleInput.value = ''; if (moodInput) moodInput.value = '';
      addMusicModal.classList.add('hidden'); showNotification('Zene sikeresen hozzáadva!', 'success');
    });

    // Weather-based recommend
    recommendBtn?.addEventListener('click', () => {
      if (!localStorage.getItem('loggedUser')) {
        showNotification('Ehhez be kell jelentkezned!', 'info');
        return;
      }
      recommendByWeather();
    });

    // Mood select filter
    moodSelect?.addEventListener('change', (e) => { const val = (e.target.value || '').trim(); applyMoodFilter(val || null); });

    // Init
    loadFavorites(); loadLibrary();
    try { const saved = JSON.parse(localStorage.getItem('stormy_playlist') || '[]'); if (Array.isArray(saved) && saved.length) { playlist = saved; loadSong(0, false); } else { updateFavoriteButton(); } } catch { updateFavoriteButton(); }
  });