// Gift Box stuff
const giftBox = document.getElementById("gift-box");
const boxKnock = new Audio("sfx/box-knock.mp3");
const boxOpen = new Audio("sfx/box-open.mp3");
const everyone = new Audio("voicelines/everyone.mp3");

// Canvas for the images
const canvas = document.getElementById("images");
const images = Array.from(document.querySelectorAll("#images > img"));
let hoveredImage = null;

// Cake Description stuff
const cakeDescContainer = document.getElementById("cake-desc-container");
cakeDescContainer.addEventListener("click", (e) => {
    openCakeDesc(false);
});

// Subtitle stuff
const subtitleContainer = document.getElementById("subtitle-container");
const speaker = document.getElementById("speaker");
const subtitle = document.getElementById("subtitle");
let audioIsPlaying = false;

// Happy Birthday voicelines
const audios = [
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/a/af/VO_Sangonomiya_Kokomi_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/f/fb/VO_Yelan_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/4/4a/VO_Xiao_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/a/a6/VO_Kuki_Shinobu_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/0/04/VO_Alyosha_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/d/d3/VO_Bennett_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/8/8e/VO_Xingqiu_Birthday_-_Customs.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/4/48/VO_Alhaitham_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/c/c9/VO_Citlali_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/e/eb/VO_Kinich_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/2/24/VO_Xiangling_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/4/40/VO_Odette_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/8/8c/VO_Yae_Miko_Birth_Date.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/9/90/VO_Qiqi_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/b/b6/VO_Cyno_Birthday.ogg"),
    new Audio("https://static.wikia.nocookie.net/gensin-impact/images/2/21/VO_Zhongli_Birthday.ogg"),
    new Audio("voicelines/paimon.mp3")
];

// Auto-close subtitle box after audio ends
audios.forEach((audio, index) => {
    if (index < audios.length - 1)
        audio.addEventListener("ended", (event) => {
            closeSubtitles();
        });
});

// Enables gift opening when the page loaded properly
window.addEventListener("load", (event) => {
    giftBox.setAttribute("onclick","openBox()");
});

// Box Opening animation
function openBox() {
    giftBox.classList.add("open");
    boxKnock.play();
    youtube.playVideo();
    setTimeout(() => {
        giftBox.classList.remove("open");
        giftBox.classList.add("open2");
        boxOpen.play();
        setTimeout(() => {
            canvas.classList.remove("hidden");
            canvas.classList.add("reveal");
            setTimeout(() => {
                everyone.play();
                setTimeout(() => {
                    canvas.classList.remove("reveal");
                    giftBox.remove();
                }, 2000);
            }, 500);
        }, 500);
    }, 1000);
}


// Loads the images and saves their alpha value for the hover events
async function loadImages() {
    for(const image of images) {
        if (!image.complete) {
            await new Promise(resolve => {
                image.addEventListener("load", resolve, { once: true });
            });
        }

        const pixelCanvas = document.createElement("canvas");
        pixelCanvas.width = image.naturalWidth;
        pixelCanvas.height = image.naturalHeight;

        const ctx = pixelCanvas.getContext("2d");

        ctx.drawImage(image, 0, 0);

        image.pixelData = ctx.getImageData(
            0,
            0,
            pixelCanvas.width,
            pixelCanvas.height
        ).data;
    }
}
loadImages();


// Hover event
// Selects the image which the cursor hovers over
canvas.addEventListener("mousemove", (event) => {
    if (audioIsPlaying) return;

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let newHoveredImage = null;

    for (let i = images.length - 1; i >= 0; i--) {
        const image = images[i];
        // Position of mouse relative to the image
        const x = mouseX - image.x;
        const y = mouseY - image.y;

        // Mouse isn't inside the image's rectangle => skip
        if (x < 0 || y < 0 ||
            x >= image.width || y >= image.height
        )
            continue;


        // Convert displayed coordinates to original image coordinates
        const pixelX = Math.floor(x * image.naturalWidth / image.width);

        const pixelY = Math.floor(y * image.naturalHeight / image.height);

        // RGBA array index
        const index =(pixelY * image.naturalWidth + pixelX) * 4;

        // Alpha channel
        const alpha = image.pixelData[index + 3];

        if (alpha > 0) {
            newHoveredImage = image;
            break;
        }
    }

    // Checks if there's a new hovered image
    if (newHoveredImage !== hoveredImage) {
        if (hoveredImage) {
            hoveredImage.classList.remove("hover");
            document.body.style.cursor = null;
        }

        if (newHoveredImage) {
            newHoveredImage.classList.add("hover");
            document.body.style.cursor = "pointer";
        }

        hoveredImage = newHoveredImage;
    }
});


// Click event
// Calls the corresponding audio file and opens the subtitles for it
canvas.addEventListener("click", (event) => {
    if (hoveredImage !== null) {
        document.body.style.cursor = null;
        audios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        })
        if (hoveredImage.id === "kokomi") {
            audios[0].play();
            setSubtitles(0);
        }
        else if (hoveredImage.id === "yelan") {
            audios[1].play();
            setSubtitles(1);
        }
        else if (hoveredImage.id === "xiao") {
            audios[2].play();
            setSubtitles(2);
        }
        else if (hoveredImage.id === "kuki") {
            audios[3].play();
            setSubtitles(3);
        }
        else if (hoveredImage.id === "alyosha") {
            audios[4].play();
            setSubtitles(4);
        }
        else if (hoveredImage.id === "bennett") {
            audios[5].play();
            setSubtitles(5);
        }
        else if (hoveredImage.id === "xingqiu") {
            audios[6].play();
            setSubtitles(6);
        }
        else if (hoveredImage.id === "alhaitham") {
            audios[7].play();
            setSubtitles(7);
        }
        else if (hoveredImage.id === "citlali") {
            audios[8].play();
            setSubtitles(8);
        }
        else if (hoveredImage.id === "kinich") {
            audios[9].play();
            setSubtitles(9);
        }
        else if (hoveredImage.id === "xiangling") {
            audios[10].play();
            setSubtitles(10);
        }
        else if (hoveredImage.id === "odette") {
            audios[11].play();
            setSubtitles(11);
        }
        else if (hoveredImage.id === "yae-miko") {
            audios[12].play();
            setSubtitles(12);
        }
        else if (hoveredImage.id === "qiqi") {
            audios[13].play();
            setSubtitles(13);
        }
        else if (hoveredImage.id === "cyno") {
            audios[14].play();
            setSubtitles(14);
        }
        else if (hoveredImage.id === "zhongli") {
            audios[15].play();
            setSubtitles(15);
        }
        else if (hoveredImage.id === "paimon") {
            audios[16].play();
            openCakeDesc(true);
        }
    }
    else {
        closeSubtitles();
    }
});


// Opens or closes the cake description container
function openCakeDesc(reveal) {
    cakeDescContainer.style.display = reveal ? "flex" : "none";
    if (!reveal) closeSubtitles();
}


// Closes the subtitles box and turns off the hovered image highlight
function closeSubtitles() {
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    })

    audioIsPlaying = false;
    subtitleContainer.style.display = "none";
    speaker.textContent = "";
    subtitle.textContent = "";

    images.forEach(image => {
        image.classList.remove("hover");
    });
}


// Corresponding subtitle for each voiceline
function setSubtitles(index) {
    hoveredImage = null;
    audioIsPlaying = true;
    subtitleContainer.style.display = "block";
    switch (index) {
        case 0:
            speaker.textContent = "Sangonomiya Kokomi";
            subtitle.textContent = "Happy birthday! So, what are your plans for the day? Oh, why don't we celebrate on Watatsumi Island? First, I'll take you out at daybreak to see the sunrise, then we can go diving during the heat of the day. In the evening, we can go for a stroll around Sangonomiya Shrine. If it rains, we'll find somewhere cozy to hide out with a few strategy books, and try to bake a cake together! In any case, no need to plan anything, the grand strategist has everything thought out for you!";
            break;
        case 1:
            speaker.textContent = "Yelan";
            subtitle.textContent = "If I was to tell you that maybe you shouldn't celebrate too hard today, because you'll let your guard down, and someone out there might just be waiting for that moment to make their move on you... it probably wouldn't go down very well. So, relax and take it easy today. Oh, and you should stop by the Yanshang Teahouse — I whipped up some treats especially for you. Not sweet ones, of course. Just the tiniest little hint of chili.";
            break;
        case 2:
            speaker.textContent = "Xiao";
            subtitle.textContent = "This mortal concept of commemorating the day of your birth really is redundant. Wait. Have this. It's a butterfly I made from leaves.\n" +
                "Okay. Take it. It's an adepti amulet — it staves off evil.";
            break;
        case 3:
            speaker.textContent = "Kuki Shinobu";
            subtitle.textContent = "Happy birthday! Here, take this special dart made from Naku Weed. Be careful, yep, that's the way to hold it... Make sure you predict the trajectory before you throw it... Hehe, I'm happy that you like it. Oh, don't treat it like a toy, it's still quite dangerous. If you want to practice a little more, I can teach you.";
            break;
        case 4:
            speaker.textContent = "Alyosha";
            subtitle.textContent = "Happy Birthday. It is today, isn't it? Y'know, where I come from, birthday celebrations are usually a luxury we can't afford. Good luck scrounging up enough flour and cream for a cake, or finding someone who sells anything but the bare essentials to use as a gift. But, I'll never begrudge a kid for wanting to celebrate their birthday. That's how it should be, and one day, I hope no child in Snezhnaya has to go without. So, I've decided to take your birthday very seriously, and I've put a lot of thought into the gift and card I got for you. Sometimes, you have to be the change you want to see in the world, right?";
            break;
        case 5:
            speaker.textContent = "Bennett";
            subtitle.textContent = "Happy birthday! Best of luck in the year ahead. Don't worry, bad luck isn't contagious! As long as I'm around, it'll be drawn to me and not you, so you're safe.";
            break;
        case 6:
            speaker.textContent = "Xingqiu";
            subtitle.textContent = "According to historical records, Tiancheng's stone bridge was formed by a fallen rock spear thrown by the Geo Archon Morax in battle. If you walk along the bridge on your birthday and throw some Mora into the sea from both sides, you will be blessed in the coming year... Your birthday only comes once a year, so be quick about it if you wanna go... I'm not kidding, it's true! Go try it and you'll see!";
            break;
        case 7:
            speaker.textContent = "Alhaitham";
            subtitle.textContent = "Happy birthday. I've always thought people are a little too enthusiastic about celebrating the day they were born. Wouldn't it be better to apply all that enthusiasm towards their daily lives and improve their standards of living? But you seem to have done well for yourself. I didn't know what kind of gift to get, so I'll just set up a special application channel, reserved for your submissions alone.";
            break;
        case 8:
            speaker.textContent = "Citlali";
            subtitle.textContent = "Happy birthday! Honestly, I don't know what to get you. There are no inauspicious stars in your path. Whether in regard to love, battle, or your future endeavors, your prospects seem great. A Mictlan-style blessing won't do much for you. I thought about getting you a copy of \"Flowers for Princess Fischl\" to get you hooked on light novels, but it seems like someone owns more books from Yae Publishing House than me... Ahh, what to do... what to do?";
            break;
        case 9:
            speaker.textContent = "Kinich & Ajaw";
            subtitle.textContent = "Kinich: Ajaw?\n" +
                "Ajaw: Alright, alright. Tch, you love bossing people around almost as much as you enjoy taking people's money. Next time, get your own pair of wings and you do the flying... You, yes you. Don't just stand there, climb up onto my back already. A ride through the skies on the back of the Almighty Dragonlord, K'uhul Ajaw is a once-in-a-lifetime honor.\n" +
                "Kinich: Don't worry, it's just a gentle cruise through the forest. Just follow me. I planned out a route in advance and I promise it's safe.\n" +
                "Ajaw: Don't forget what you promised me in return!\n" +
                "Kinich: Alright, now hop on... Happy birthday.";
            break;
        case 10:
            speaker.textContent = "Xiangling";
            subtitle.textContent = "Ah, there you are! Come with me, I've prepared a birthday feast all for you! ... No really, I insist! Which dish is your favorite? It's okay, take your time, try them all first, then let me know!";
            break;
        case 11:
            speaker.textContent = "Odette";
            subtitle.textContent = "Happy Birthday! I was trying to think of what to get you... I usually receive things like flowers, ballet shoes, and music boxes, but I doubt that's what you have in mind. How about you simply... make a wish, here and now? Ideally, something within my power to grant, of course...";
            break;
        case 12:
            speaker.textContent = "Yae Miko";
            subtitle.textContent = "Ah, so today is your birthday... \"On your ceremonious reckoning of years, I task my kin with seeing to it that that which you seek, you shall surely find, and that that for which your heart longs, you shall surely receive. Remain pure of heart and true of spirit, and their protection shall be bestowed on you.\" There you go. May all go well in your year ahead, and may all your wishes be fulfilled. Are we done?";
            break;
        case 13:
            speaker.textContent = "Qiqi";
            subtitle.textContent = "Many happy returns. Here is a bag of herbal medicine for you. You must be very surprised that I remembered? Let me explain. Last time you told me, I wrote your birthday down on a piece of paper. If I look at something once a day, it eventually goes into my long-term memory, and it will stay there forever.";
            break;
        case 14:
            speaker.textContent = "Cyno";
            subtitle.textContent = "Ahem... I'd like to wish you a happy birthday. Though I don't have much experience with celebrations, once I realized your birthday was coming, I decided to make some preparations. First, I have this deck for you that I worked on for a few days, I think it'll really suit your style. Also, I adjusted my schedule to open up some time, so is there anywhere you'd like to go? I'd be happy to accompany you. A birthday only lasts a day, but you should take the chance to really enjoy it. Just make sure we can be back within three days.";
            break;
        case 15:
        speaker.textContent = "Zhongli";
            subtitle.textContent = "Happy birthday. This is a dried Glaze Lily that came into bloom on the day of your birth. Long ago, the people of Liyue would say that this flower blooms bearing the weight of the beautiful memories and prayers of the land. I believe this to have been applied on the day you were born as well.";
            break;
    }
}
