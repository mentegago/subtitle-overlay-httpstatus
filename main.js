const subtitleContainer = document.querySelector("#subtitle")

var isSongRunning = false;
var subtitleTimerId = null;

const showSubtitle = (subtitles, index = -1, initialStartOffset = 0) => {
    if(!isSongRunning) { return }
    if(index == -1) {
        const nextStartTime = subtitles[index+1].startTime
        subtitleTimerId = setTimeout(() => { showSubtitle(subtitles, index+1) }, nextStartTime + initialStartOffset)
        subtitleContainer.innerHTML = "<span class=\"sub_status\">🧈 Mentega Subtitle Overlay 🧈</span>"
        return;
    }

    const songName = (i) => {
        if(i<8) return "Sik Sik Sibatumanikam (North Sumatra)";
        if(i<16) return "Kicir Kicir (DKI Jakarta)";
        if(i<28) return "Cublak Cublak Suweng (Central Java)";
        if(i<34) return "Bungong Jeumpa (Aceh)";
        if(i<38) return "Apuse (Papua)"
        return "";
    };

    subtitleContainer.innerHTML = `<span class="song_name">${songName(index)}</span><br>${subtitles[index].text}`;
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
            if(msg.status.beatmap.songName.includes("Indonesia")) {
                if(subtitleTimerId) {
                    clearTimeout(subtitleTimerId)
                    subtitleTimerId = null
                }

                isSongRunning = true
                subtitleContainer.style.display = 'block'
                showSubtitle(subtitles, -1, 1924)
            }
        } else if(msg.event == "menu") {
            if(subtitleTimerId) {
                clearTimeout(subtitleTimerId)
                subtitleTimerId = null
            }

            if(isSongRunning) {
                isSongRunning = false
                subtitleContainer.innerHTML = "<span class=\"sub_status\">🧈 Mentega Subtitle Overlay Stopped 🧈</span>"
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

loadSubtitle("https://gist.githubusercontent.com/mentegago/9ed07208bbcc71e6802b1e4422b17d7c/raw/5851d3726fcdc183719a4f4ff58ee52f21b138e8/subtitle.srt")
    .then(subtitles => {
        console.log("Subtitle loaded! Starting websocket...")
        connect('ws://127.0.0.1:6557/socket', subtitles)
    })