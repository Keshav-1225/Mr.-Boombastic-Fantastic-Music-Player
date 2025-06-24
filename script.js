// ========== Audio Player Setup ==========
let currentSong = new Audio();  // Used to play the current track and prevent overlapping songs

// ========== Fetch Songs from Server ==========
async function getSongs() {
    // Fetch the list of songs from the server directory
    const dir = await fetch('http://127.0.0.1:3000/songs/');
    let response = await dir.text();    // Convert HTML response to text

    // Parse the HTML to extract song links
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = []
    for (i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/"))
        }
    }
    return songs
}

// ========== Display Songs in Sidebar ==========
function displaySongs(songs) {
    let displaySongsPlaylist = document.querySelector(".playlist-display").getElementsByTagName("ul")[0];
    for (let song of songs) {
        song = song[1].replaceAll("%20", " ")
        song = song.replaceAll("%C2%A3%C3%BC", "<span hidden>%C2%A3%C3%BC</span>")
        displaySongsPlaylist.innerHTML += `<li>
                            <img src="images/music.svg" alt="music">
                            <div class="song hover">${song}</div>
                            <img src="images/play.svg" alt="play now" class="hover">
                        </li>`
    }
}

// ========== Play Selected Song ==========
function PlaySong(track, pause = true) {
    // Play the selected song and update play/pause button
    currentSong.src = "/songs/" + track;
    currentSong.play()
    document.querySelector(".playpause").innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`;
}

// ========== Update Song Timer ==========
function updateTimer(currentTime, duration) {
    // Format seconds to mm:ss
    function formatTime(sec) {
        if (isNaN(sec)) return "00:00";
        let minutes = Math.floor(sec / 60);
        let seconds = Math.floor(sec % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    document.querySelector(".timer").textContent = `${formatTime(currentTime)}/${formatTime(duration)}`;
}

// ========== Main App Logic ==========
async function main() {
    let play = document.querySelector(".playpause");
    let songs = await getSongs()
    let display = displaySongs(songs);
    let selectedsong = Array.from(document.querySelectorAll(".song"));
    let displaySongName = document.querySelector(".songinfo");

    // Add click event to each song in the sidebar
    selectedsong.forEach(element => {
        element.addEventListener("click", () => {
            displaySongName.textContent = element.textContent.replaceAll("%C2%A3%C3%BC", " ");
            PlaySong(element.textContent.trim(), false)
        })
    });

    // Play/Pause button logic
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`
        } else {
            currentSong.pause()
            play.innerHTML = `<img src="images/play-button.svg" alt="Play/Pause button">`
        }
    })

    // Update seekbar and timer as song plays
    currentSong.addEventListener("timeupdate", () => {
        updateTimer(currentSong.currentTime, currentSong.duration);
        let percent = 0;
        if (currentSong.duration && !isNaN(currentSong.duration)) {
            percent = (currentSong.currentTime / currentSong.duration) * 100;
        }
        document.querySelector(".dot").style.left = `${percent}%`;
        document.querySelector(".seekbar-fill").style.width = `${percent}%`;
    })

    // Seekbar click: jump to position in song
    document.querySelector(".seekbar").addEventListener("click", e => {
        let seekbar = e.currentTarget;
        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let seekbarClick = (offsetX / rect.width) * 100;
        document.querySelector(".dot").style.left = `${seekbarClick}%`;
        document.querySelector(".seekbar-fill").style.width = `${seekbarClick}%`;
        currentSong.currentTime = (currentSong.duration)*seekbarClick/100;
    })

    // Sidebar close (cross icon)
    document.querySelector(".cross-icon").addEventListener("click",e=>{
        document.querySelector(".sidebar").classList.add("hideSidebar")
        // document.querySelector(".mainwindow").classList.add("width100")
    })
}
main()