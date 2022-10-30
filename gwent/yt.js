var youtube;

function onYouTubeIframeAPIReady() {
    youtube = new YT.Player('youtube', {
        videoId: "UE9fPWy1_o4",
        playerVars: {
            "autoplay": 1,
            "controls": 0,
            "loop": 1,
            "playlist": "UE9fPWy1_o4",
            "version": 3
        }
    });
}

function toggleMusic() {
    if (youtube.getPlayerState() !== YT.PlayerState.PLAYING)
        youtube.playVideo();
    else
        youtube.pauseVideo();
}
