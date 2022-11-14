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

    youtube.playVideo();
    let timer = setInterval(() => {
        if (youtube.getPlayerState() !== YT.PlayerState.PLAYING)
            youtube.playVideo();
        else
            clearInterval(timer);
    }, 500);
}
