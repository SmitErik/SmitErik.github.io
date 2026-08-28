var youtube;

function onYouTubeIframeAPIReady() {
    youtube = new YT.Player('youtube', {
        videoId: "Mcz3yZSUVI8",
        playerVars: {
            "autoplay": 0,
            "controls": 0,
            "loop": 1,
            "playlist": "Mcz3yZSUVI8",
            "version": 3
        }
    });
}
