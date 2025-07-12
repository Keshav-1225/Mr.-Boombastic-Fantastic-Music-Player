// ========== Audio Player Setup ==========
let previousVolume = 0.5;
let currentSong = new Audio();  // Used to play the current track and prevent overlapping songs

//=========== Fetch Folders from server=========
async function getPlaylist() {
    const dir = await fetch('http://127.0.0.1:3000/songs/');
    const response = await dir.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let a_list = div.getElementsByTagName("a");
    let playlists = [];
    for (i = 1; i < a_list.length; i++) {
        const element = a_list[i];
        playlists.push(element.href.split("/songs/")[1])
    }
    return playlists
}

//============== Display Playlists ====================
// display playlist cards and handle click to load songs
async function displayPlaylist(){
    const playlists = await getPlaylist();
    let cardsContainer = document.querySelector(".cards-container");
    // ai corrected: declare currentFolder globally
    window.currentFolder = null;
    for (const element of playlists) {
        const dir = await fetch(`http://127.0.0.1:3000/songs/${element}/info.json`);
        const response = await dir.json()
        cardsContainer.innerHTML += `<div class="card">
                            <div class="cardImage"><img src=${response.cover} alt=${response.alt}></div>
                            <div class="playButton"><img src="images/play-button.svg" alt=""></div>
                            <div class="cardTitle"><h4>${response.title}</h4></div>
                            <div class="cardArtist txtColor">${response.description}</div>
                            <div class="link" hidden>${element}</div>    
                        </div>`;
    }
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click",async ()=>{
            // ai corrected: update global currentFolder when playlist is selected
            window.currentFolder = e.querySelector(".link").textContent;
            songs = await getSongs(window.currentFolder);
            displaySongs(songs, window.currentFolder);
        })
    });
}

// ========== Fetch Songs from Server ==========
// fetch songs from selected playlist folder
async function getSongs(currentFolder) {
    const dir = await fetch(`http://127.0.0.1:3000/songs/${currentFolder}`);
    let response = await dir.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let a_list = div.getElementsByTagName("a");
    songs = []
    for (i = 0; i < a_list.length; i++) {
        const element = a_list[i];
        if (element.href.endsWith(".mp3")|| element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/songs/${currentFolder}`))
        }
    }
    return songs
}

// ========== Display Songs in Sidebar ==========
//pass currentFolder to PlaySong when a song is clicked
function displaySongs(songs, currentFolder) {
    let displaySongsPlaylist = document.querySelector(".playlist-display").getElementsByTagName("ul")[0];
    displaySongsPlaylist.innerHTML = "<li></li>";
    for (let song of songs) {
        let songName = song[1].replaceAll("%20", " ").replaceAll("%C2%A3%C3%BC", "<span hidden>%C2%A3%C3%BC</span>");
        displaySongsPlaylist.innerHTML += `<li>
                            <img src="images/music.svg" alt="music">
                            <div class="song hover">${songName}</div>
                            <img src="images/play.svg" alt="play now" class="hover">
                        </li>`;
    }
    //Add click event to each song in the sidebar after rendering
    let selectedsong = Array.from(document.querySelectorAll(".song"));
    let displaySongName = document.querySelector(".songinfo");
    selectedsong.forEach(element => {
        element.addEventListener("click", () => {
            displaySongName.textContent = element.textContent.replaceAll("%C2%A3%C3%BC", " ");
            // ai corrected: Use the correct folder for playback
            let songIndex = selectedsong.indexOf(element);
            PlaySong(songs[songIndex][1], currentFolder, false);
        });
    });
}

// ========== Play Selected Song ==========
//Accept currentFolder as an argument to play the correct song
function PlaySong(track, currentFolder, pause = true) {
    currentSong.src = `/songs/${currentFolder}${track}`;
    currentSong.play();
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
    // ai corrected: use global currentFolder
    window.currentFolder = null;
    await displayPlaylist();
    let play = document.querySelector(".playpause");
    let displaySongName = document.querySelector(".songinfo");
    let selectedsong = Array.from(document.querySelectorAll(".song"));
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
            play.innerHTML = `<img src="images/pause.svg" alt="Play/Pause button">`
            if (!currentSong.src && selectedsong.length > 0) {
                displaySongName.textContent = (selectedsong[0].textContent.replaceAll("%C2%A3%C3%BC", " "));
                // ai corrected: Play the first song in the current folder
                PlaySong(songs[0][1], currentFolder, false);
            }
            currentSong.play()
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
        //auto play next song when current ends
        if(Math.ceil(currentSong.currentTime) == Math.ceil(currentSong.duration))
        {
            nextSong();
        }
    })

    // Seekbar click: jump to position in song
    document.querySelector(".seekbar").addEventListener("click", e => {
        let seekbar = e.currentTarget;
        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let seekbarClick = (offsetX / rect.width) * 100;
        document.querySelector(".dot").style.left = `${seekbarClick}%`;
        document.querySelector(".seekbar-fill").style.width = `${seekbarClick}%`;
        currentSong.currentTime = (currentSong.duration) * seekbarClick / 100;
    })

    // Sidebar close (cross icon)
    let crossIcon = Array.from(document.querySelectorAll('.cross-icon'));
    crossIcon.forEach(e => {
        e.addEventListener("click", () => {
            document.querySelector(".sidebar").classList.add("hideSidebar");
            document.querySelector(".mainwindow").classList.add("mainwindow_expand");
        })
    })
    //Sidebar open(hamburger icon)
    document.querySelector('.hamburger').addEventListener("click", e => {
        document.querySelector(".sidebar").classList.remove("hideSidebar")
        document.querySelector(".mainwindow").classList.remove("mainwindow_expand")
    });
    //=========PREVIOUS AND NEXT BUTTON=========================
    //Previous Button
    document.querySelector("#prviousTrack").addEventListener("click", () => {
        try{
            arrayOfSongs = []
            for (const i of songs) {
                arrayOfSongs.push(i.join(`/songs/${window.currentFolder}`));
            }
            if (arrayOfSongs.includes(currentSong.src)) {
                let index = arrayOfSongs.indexOf(currentSong.src);
                PlaySong(songs[index-1][1],window.currentFolder,false)
                displaySongName.textContent = songs[index-1][1].replaceAll("%20"," ").replaceAll("%C2%A3%C3%BC", "|");
            } else {
                PlaySong(songs[0][1],window.currentFolder,false)
            }
        }catch(error){
            PlaySong(songs[0][1],window.currentFolder,false);
            displaySongName.textContent = songs[0][1].replaceAll("%20"," ").replaceAll("%C2%A3%C3%BC", "|");
        }
    })
    //Next Button
    document.querySelector("#NextTrack").addEventListener("click", nextSong)
    function nextSong(){
        try{
            arrayOfSongs = []   
            for (const i of songs) {
                arrayOfSongs.push(i.join(`/songs/${window.currentFolder}`));
            }
            if (arrayOfSongs.includes(currentSong.src)) {
                let index = arrayOfSongs.indexOf(currentSong.src);
                PlaySong(songs[index+1][1],window.currentFolder,false)
                displaySongName.textContent = songs[index+1][1].replaceAll("%20"," ").replaceAll("%C2%A3%C3%BC", "|");
            } else {
                PlaySong(songs[1][1],window.currentFolder,false)
                displaySongName.textContent = songs[1][1].replaceAll("%20"," ").replaceAll("%C2%A3%C3%BC", "|");
            }
        }catch(error){
            PlaySong(songs[0][1],window.currentFolder)
            displaySongName.textContent = songs[0][1].replaceAll("%20"," ").replaceAll("%C2%A3%C3%BC", "|");
        }
    }
    //Volume Functionality
    document.querySelector(".volumeRange").addEventListener("change",(e) => {
        currentSong.volume = parseInt(e.target.value)/100;
        previousVolume = currentSong.volume
    })
    //Mute
    document.querySelector(".volumeImg").addEventListener("click",()=>{
        if (currentSong.volume){
            currentSong.volume = 0;
            document.querySelector(".volumeImg").src = "images/mute.svg"
        }else{
            currentSong.volume = previousVolume;
            document.querySelector(".volumeImg").src = "images/volume.svg"
        }
    })
}
main()