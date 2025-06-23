let currentSong = new Audio();  //It is used to play the current track so that when a song is changed, new track starts playing instead of overlapping and playing both the songs
async function getSongs() { //This function creates an array of songs fetched in the songs folder.
    const dir = await fetch('http://127.0.0.1:3000/songs/');
    let response = await dir.text();    // it converts the html into text

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

function displaySongs(songs) {  //It displays the song in the sidebar
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
function PlaySong(track, pause = true) {   //It plays the song whenever a song is selected
    // let audio = new Audio("/songs/"+track);
    currentSong.src = "/songs/" + track;
    currentSong.play()
    document.querySelector(".playpause").innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`;
}
function updateTimer(currentTime, duration) {   //It is used to showcase duration of the song. Created by github copilot
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
            PlaySong(element.textContent.trim(), false)
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
    currentSong.addEventListener("timeupdate", () => {
        updateTimer(currentSong.currentTime, currentSong.duration);
        let percent = 0;
        if (currentSong.duration && !isNaN(currentSong.duration)) {
            percent = (currentSong.currentTime / currentSong.duration) * 100;
        }
        document.querySelector(".dot").style.left = `${percent}%`;
        document.querySelector(".seekbar-fill").style.width = `${percent}%`;
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(`offset x = ${e.offsetX} \noffset Y = ${e.offsetY} \nScreen X = ${e.screenX} \nScreen Y = ${e.screenY}`);
        let seekbar = e.currentTarget;
        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let seekbarClick = (offsetX / rect.width) * 100;
        document.querySelector(".dot").style.left = `${seekbarClick}%`;
        document.querySelector(".seekbar-fill").style.width = `${seekbarClick}%`;
        currentSong.currentTime = (currentSong.duration)*seekbarClick/100;
    })
    document.querySelector(".cross-icon").addEventListener("click",e=>{
        document.querySelector(".sidebar").classList.add("hideSidebar")
        // document.querySelector(".mainwindow").classList.add("width100")
    })
}
main()