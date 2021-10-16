const subtitleContainer = document.querySelector("#subtitle")

var isSongRunning = false;
var subtitleTimerId = null;

const showSubtitle = (subtitles, index = -1, initialStartOffset = 0) => {
    if(!isSongRunning) { return }
    if(index == -1) {
        const nextStartTime = subtitles[index+1].startTime
        subtitleTimerId = setTimeout(() => { showSubtitle(subtitles, index+1) }, nextStartTime + initialStartOffset)
        subtitleContainer.innerHTML = "<span class=\"sub_status\">🧈 Subtitle starting... 🧈</span>"
        return;
    }

    subtitleContainer.innerHTML = subtitles[index].text;
    if(index+1 == subtitles.length) return;

    const currentStartTime = subtitles[index].startTime;
    const nextStartTime = subtitles[index+1].startTime;

    subtitleTimerId = setTimeout(() => { showSubtitle(subtitles, index+1) }, nextStartTime - currentStartTime);
}

const connect = (url, subtitles) => {
    const ws = new WebSocket(url);
    ws.onmessage = (message) => {
        const msg = JSON.parse(message.data)
        if(msg.event == "songStart") {
            if(!songName || msg.status.beatmap.songName.toLowerCase().includes(songName)) {
                if(subtitleTimerId) {
                    clearTimeout(subtitleTimerId)
                    subtitleTimerId = null
                }

                isSongRunning = true
                subtitleContainer.style.display = 'block'
                showSubtitle(subtitles, -1, initialDelay)
            }
        } else if(msg.event == "menu") {
            if(subtitleTimerId) {
                clearTimeout(subtitleTimerId)
                subtitleTimerId = null
            }

            if(isSongRunning) {
                isSongRunning = false
                subtitleContainer.innerHTML = "<span class=\"sub_status\">🧈 Subtitle stopped 🧈</span>"
                setTimeout(() => { 
                    subtitleContainer.innerHTML = ''
                    subtitleContainer.style.display = 'none'
                 }, 1500)
            }
        }
    }

    ws.onopen = (event) => {
        console.log("Websocket connected!")
    }

    ws.onclose = (event) => {
        console.log("Websocket connection closed. Retrying in 2 seconds")
        setTimeout(() => { connect(url, subtitles) }, 1999) // I lied! Retrying in 1.999 seconds :)
    }

    ws.onerror = (event) => {
        console.log("Websocket connection error!")
        ws.close()
    }
}

const urlSearchParams = new URLSearchParams(window.location.search)
const subtitleURL = urlSearchParams.get('url')
const songName = urlSearchParams.has('name') ? urlSearchParams.get('name').toLowerCase() : null
const initialDelay = urlSearchParams.has('initialdelay') ? parseInt(urlSearchParams.get('initialdelay')) : 0

// https://gist.githubusercontent.com/mentegago/9ed07208bbcc71e6802b1e4422b17d7c/raw/5851d3726fcdc183719a4f4ff58ee52f21b138e8/subtitle.srt
// delay: 1924
loadSubtitle(subtitleURL)
    .then(subtitles => {
        console.log("Subtitle loaded! Starting websocket...")
        connect('ws://127.0.0.1:6557/socket', subtitles)
    })