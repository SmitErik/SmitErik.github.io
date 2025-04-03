fetch('patch_notes').then(x => x.text()).then(x => {
    let lines = x.split('\n');
    document.getElementById('version').innerHTML = lines[0];

    let patches = '<hr>';
    let list = false;
    let listNumber = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length === 0) {
            if (!list)
                patches += '</span>';
            patches += '<hr>';
            list = 0;
            continue;
        }

        if (lines[i].charAt(0) >= 0 && lines[i].charAt(0) <= 9)
            patches += '\n<span class="patch"><b class="big">' + lines[i] + '</b> ~ ';

        else if (lines[i].charAt(0) === ':') {
            if (!list)
                patches += '<span class="dropdown closed" id="' + listNumber + '" onclick="dropdown(' + listNumber + ')"></span></span><ul id="list' + (listNumber++) + '">';
            else
                patches += '</ul>';

            list = !list;
        }

        else {
            if (list)
                patches += '<li>' + lines[i] + '</li>';
            else
                patches += lines[i];
        }
    }

    document.getElementById('patches').innerHTML = patches;
})

function dropdown(listID) {
    if (document.getElementById(listID).classList.contains('closed')) {
        document.getElementById(listID).classList.remove('closed');
        document.getElementById(listID).classList.add('opened');

        document.getElementById('list' + listID).style.display = 'block';
    }
    else {
        document.getElementById(listID).classList.remove('opened');
        document.getElementById(listID).classList.add('closed');

        document.getElementById('list' + listID).style.display = 'none';
    }
}