// alert('Script is connevcted')
let currentSong = new Audio();
async function getSongs() {
    const dir = await fetch('http://127.0.0.1:3000/songs/');
    let response = await dir.text();

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

function displaySongs(songs) {
    let displaySongsPlaylist = document.querySelector(".playlist-display").getElementsByTagName("ul")[0];
    for (let song of songs) {
        song = song[1].replaceAll("%20", " ")
        song = song.replaceAll("%C2%A3%C3%BC", "<span hidden>%C2%A3%C3%BC</span>")
        displaySongsPlaylist.innerHTML += `<li>
                            <img src="images/music.svg" alt="music">
                            <div class="song">${song}</div>
                            <img src="images/play.svg" alt="play now" class="hover">
                        </li>`
    }
}
function PlaySong(track,pause=true) {
    // let audio = new Audio("/songs/"+track);
    currentSong.src = "/songs/" + track;
    currentSong.play()
    document.querySelector(".playpause").innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`;
}
function updateTimer(currentTime, duration) {
    function formatTime(sec) {
        if (isNaN(sec)) return "00:00";
        let minutes = Math.floor(sec / 60);
        let seconds = Math.floor(sec % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    document.querySelector(".timer").textContent = `${formatTime(currentTime)}/${formatTime(duration)}`;
}
async function main() {
    let play = document.querySelector(".playpause");
    let songs = await getSongs()
    let display = displaySongs(songs);
    let selectedsong = Array.from(document.querySelectorAll(".song"));
    let displaySongName = document.querySelector(".songinfo");
    selectedsong.forEach(element => {
        element.addEventListener("click", () => {
            displaySongName.textContent = element.textContent.replaceAll("%C2%A3%C3%BC", " ");
            PlaySong(element.textContent.trim(),false)
        })
    });
    console.log(play.innerHTML)
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`
        } else {
            currentSong.pause()
            play.innerHTML = `<img src="images/play-button.svg" alt="Play/Pause button">`
        }
    })
}
currentSong.addEventListener("timeupdate", () => {
    updateTimer(currentSong.currentTime, currentSong.duration);
})
main()