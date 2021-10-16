const parser = new Parser();

const calculateTime = (timex) => {
    const time = timex.match(/[0-9]+/g)
    return parseInt(time[0])*60*60*1000 + parseInt(time[1])*60*1000 + parseInt(time[2])*1000 + parseInt(time[3]);
}

const loadSubtitle = async (url) => {
    return fetch(url)
        .then(response => response.text())
        .then(text => parser.fromSrt(text))
        .then(subtitles => subtitles.map((subtitle) => {
            var timedSubtitle = subtitle
            timedSubtitle.startTime = calculateTime(timedSubtitle.startTime)
            timedSubtitle.endTime = calculateTime(timedSubtitle.endTime)

            return timedSubtitle
        }))
}