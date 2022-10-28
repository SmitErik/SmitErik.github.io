let legend = document.getElementById('legend'),
    rows = legend.children[0].children,
    closed = true;

function openLegend() {
    if (closed)
        for (let i = 0; i < rows.length; i++) {
            let text = rows[i].children[1];
            text.style.paddingLeft = '2vh';
            text.style.opacity = '1';
            text.style.fontSize = 'inherit';
            text.style.visibility = 'visible';
        }
    else
        for (let i = 0; i < rows.length; i++) {
            let text = rows[i].children[1];
            text.style.paddingLeft = '0';
            text.style.opacity = '0';
            text.style.fontSize = '0';
            text.style.visibility = 'collapse';
        }

    closed = !closed;
}