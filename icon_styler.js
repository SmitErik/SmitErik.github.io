let iconContainers = document.getElementsByClassName('icons');
const ROW_COUNT = 4,
      GAME_WIDTH = 13,
      ICON_WIDTH = 3;

for (let i = 0; i < iconContainers.length; i++) {
    const iconContainer = iconContainers[i];
    const gameContainer = iconContainer.parentElement;
    const columnCount = Math.ceil(iconContainer.childElementCount / ROW_COUNT);
    const iconNewWidth = ICON_WIDTH * columnCount;
    iconContainer.style.width = (iconNewWidth) + 'vh';
    gameContainer.style.width = (GAME_WIDTH + iconNewWidth) + 'vh';
}