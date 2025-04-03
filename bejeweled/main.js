$(async function() {
    let music = new Audio('music/bejeweled_music.mp3');
    music.loop = true;
    let announcer = [], spoke = false;
    let mouse_click = new Audio('sfx/mouse_click.mp3'), mouse_hover = new Audio('sfx/mouse_hover.mp3');
    let game_start = new Audio('sfx/game_start.mp3');
    let gem_combos = [], gem_collapse = new Audio('sfx/gems/collapse.mp3'), gem_grab = new Audio('sfx/gems/grab.mp3'),
        gem_pair = new Audio('sfx/gems/pair.mp3'), bad_move = new Audio('sfx/bad_move.mp3'),
        bomb_explode = new Audio('sfx/bomb_explode.mp3'), power_cube_shoot = new Audio('sfx/power_cube_shoot.mp3');

    for (let i = 0; i < 7; i++) {
        if (i < 5)
            gem_combos.push(new Audio('sfx/gems/combo/' + i + '.mp3'));

        switch (i) {
            case 0:
                announcer.push(new Audio('sfx/announcer/welcome_back.mp3'));
                break;
            case 1:
                announcer.push(new Audio('sfx/announcer/get_ready.mp3'));
                break;
            case 2:
                announcer.push(new Audio('sfx/announcer/go.mp3'));
                break;
            case 3:
                announcer.push(new Audio('sfx/announcer/time_up.mp3'));
                break;
            case 4:
                announcer.push(new Audio('sfx/announcer/good.mp3'));
                break;
            case 5:
                announcer.push(new Audio('sfx/announcer/excellent.mp3'));
                break;
            case 6:
                announcer.push(new Audio('sfx/announcer/incredible.mp3'));
                break;
        }
    }

    start();

    function start() {
        let musicInterval = setInterval(() => {
            let promise = music.play();
            if (promise !== undefined) promise.then(() => clearInterval(musicInterval)).catch(() => {});
        }, 500);

        let announcerInterval = setInterval(() => {
            let promise = announcer[0].play();
            if (promise !== undefined) promise.then(() => clearInterval(announcerInterval)).catch(() => {});
        }, 500);
    }

    function playSound(sound) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.play();
    }

    $('.button').click(() => playSound(mouse_click)).hover(() => playSound(mouse_hover), function () {});

    let main = $('#main'), game = $('#game'), game_over = $('#game_over');
    let shadow = $('#shadow'), created_by = $('#created_by');

    $('#quit_button').click(() => history.back());

    let input = $('input');
    let player_name;
    input.on('input', () => input.removeClass('input_error'));

    input.bind('keydown', function (e) {
        let regex = new RegExp("^[^>\\\\]+$");
        if (!regex.test(e.key)) {
            e.preventDefault();
            return false;
        }
    });

    $('#play_button').click(() => {
        input.val(input.val().trim());
        if (input.val().length === 0 || input.val().includes('\\') || input.val().includes('>')) {
            input.focus();
            input.addClass('input_error');
            return;
        }

        if (input.val().length > 20)
            input.val(input.val().substring(0, 19) + '…');

        player_name = input.val();

        playSound(announcer[1]);
        playSound(game_start);

        created_by.animate({opacity: '0'}, 500);
        main.animate({opacity: '0'}, 500, () => {
            main.css('display', 'none');
            $('#time').css('width', '100%');
            $('#timer > span').text('60s');
            $('#score').text('0');
            $('#history').empty();
            game.css('display', 'block').animate({opacity: '1'}, 500, () => startGame());
        });
    });

    $('#menu_button').click(() => {
        game.animate({opacity: '0'}, 500, () => game.css('display', 'none'));
        shadow.animate({opacity: '0'}, 500, () => shadow.css('display', 'none'));
        game_over.animate({opacity: '0'}, 500, () => {
            if (spoke) spoke = false;
            else playSound(announcer[0]);
            game_over.css('display', 'none');
            $('#canvas').empty();
            created_by.animate({opacity: '1'}, 500);
            main.css('display', 'block').animate({opacity: '1'}, 500);
        });
    });

    setLeaderboard();

    function setLeaderboard() {
        let db = localStorage.getItem('database');
        let board = $('#board').empty();

        if (db !== 'null' && db.length > 0) {
            db = db.split('\n');

            for (let i = 0; i < db.length - 1; i++) {
                let d = db[i].trim().split('\\');
                let record = $('<div class="record"></div>');
                $('<span>' + (i + 1) + '.</span>').appendTo(record);
                $('<span>' + d[0] + '</span>').appendTo(record);
                $('<span>' + d[1] + '</span>').appendTo(record);
                board.append(record);
            }
        }
    }

    async function startGame() {
        let spinning = false, clickable = false;
        let gems = [], pairs = [];

        let timer = $('#time'), timer_text = $('#timer > span');
        let time = 60;

        let score_text = $('#score');
        let score = 0, score_multiplier = 0;

        let interval = setInterval(() => {
            if (time > 0)
                changeTime(-0.1);
            else if (clickable)
                gameOver();
        }, 100);

        let power_cube_ids = [], drawing_area = null;

        let history = $('#history');

        for (let i = 0; i < 64; i++) {
            let div = $('#canvas').append('<div class="gem_holder"></div>').find('div:last-child');
            let random = Math.floor(Math.random() * 7);
            let url = 'images/gems/' + random + '.png';
            let img = $('<span style="background-image: url(' + url + ')" class="gem" id="' + i + '" type="' + random + '"></span>')
                .appendTo(div);
            $('<b class="score_point"></b>').appendTo(div);
            gems.push(img);
        }

        function setClickable(on) {
            clickable = on;
            $('.gem').each(function () { $(this).toggleClass('clickable'); });
        }

        await replacePairs();

        gems.forEach(g => g.css('top', '-800%').animate({ top: '0' },
            (8 - Math.floor(parseInt(g.attr('id'), 10) / 8)) * 100));

        gemFall(8);

        setTimeout(() => {
            setClickable(true);
            playSound(announcer[2]);
        }, 800);

        function gemFall(rows) {
            let row = 0, gem_falling = setInterval(() => {
                playSound(gem_collapse);

                if (++row >= rows)
                    clearInterval(gem_falling);
            }, 100);
        }

        $('html').click(function (e) {
            if (spinning && !e.target.classList.contains('gem')) {
                spinning = false;
                let spinning_gem = $('.spinning');
                spinning_gem.removeClass('spinning').css('background-image', 'url("images/gems/' +
                    spinning_gem.attr('type') + (spinning_gem.attr('type') < 7 ? '.png")' : '.gif'));
            }
        });

        $('.gem').click(async function() {
            if (!clickable)
                return;

            spinning = !spinning;

            if (spinning) {
                playSound(gem_grab);
                let gem_type = gems[$(this).attr('id')].attr('type');
                $(this).addClass('spinning').css('background-image', 'url("images/gems/' + gem_type +
                    (gem_type < 7 ? '.gif")' : '_.gif")'));
            }
            else {
                if ($(this).hasClass('spinning')) {
                    $(this).removeClass('spinning').css('background-image', 'url("images/gems/' + $(this).attr('type') +
                        ($(this).attr('type') < 7 ? '.png")' : '.gif")'));
                    return;
                }

                setClickable(false);

                let id = parseInt($(this).attr('id'), 10);
                let t_pos = [];
                t_pos.push(Math.floor(id / 8));
                t_pos.push(id % 8);

                let spinning_gem = $('.spinning');
                id = parseInt(spinning_gem.attr('id'), 10);
                let s_pos = [];
                s_pos.push(Math.floor(id / 8));
                s_pos.push(id % 8);

                if (t_pos[0] === s_pos[0] - 1 && t_pos[1] === s_pos[1]) {
                    spinning_gem.animate({ top: '-100%' }, 500);
                    $(this).animate({ top: '100%' }, 500, async () =>
                        await checkMove(spinning_gem, $(this), -8)
                    );
                }
                else if (t_pos[0] === s_pos[0] + 1 && t_pos[1] === s_pos[1]) {
                    spinning_gem.animate({ top: '100%' }, 500);
                    $(this).animate({ top: '-100%' }, 500, async () =>
                        await checkMove(spinning_gem, $(this), 8)
                    );
                }
                else if (t_pos[1] === s_pos[1] - 1 && t_pos[0] === s_pos[0]) {
                    spinning_gem.animate({ left: '-100%' }, 500);
                    $(this).animate({ left: '100%' }, 500, async () =>
                        await checkMove(spinning_gem, $(this), -1)
                    );
                }
                else if (t_pos[1] === s_pos[1] + 1 && t_pos[0] === s_pos[0]) {
                    spinning_gem.animate({ left: '100%' }, 500);
                    $(this).animate({ left: '-100%' }, 500, async () =>
                        await checkMove(spinning_gem, $(this), 1)
                    );
                }
                else
                    await checkMove(spinning_gem, $(this));
            }
        });

        async function checkMove(chosen = null, target = null, direction = null) {
            if (direction != null) {
                let chosen_id = parseInt(chosen.attr('id'), 10);
                let target_id = parseInt(target.attr('id'), 10);

                let chosen_gem = gems[chosen_id];
                gems[chosen_id] = gems[target_id];
                gems[target_id] = chosen_gem;

                if (await scanForPairs([chosen_id, target_id])) {
                    let chosen_gem_type = gems[chosen_id].attr('type');
                    let target_gem_type = gems[target_id].attr('type');

                    if (!gems[chosen_id].hasClass('in_a_pair') || !gems[target_id].hasClass('in_a_pair')) {
                        gems[chosen_id].css('background-image', gems[target_id].css({'background-image': 'url("images/gems/' +
                            chosen_gem_type + (chosen_gem_type < 7 ? '.png")' : '.gif")'), top: '0', left: '0', right: '0'})).
                        toggleClass('in_a_pair');
                        gems[target_id].css('background-image', gems[chosen_id].css({'background-image': 'url("images/gems/' +
                            target_gem_type + (target_gem_type < 7 ? '.png")' : '.gif")'), top: '0', left: '0', right: '0'})).
                        toggleClass('in_a_pair');
                    }

                    gems[chosen_id].attr('type', target_gem_type);
                    gems[target_id].attr('type', chosen_gem_type);

                    if (gems[chosen_id].hasClass('explosive') && !gems[target_id].hasClass('explosive')) {
                        gems[chosen_id].removeClass('explosive');
                        gems[target_id].addClass('explosive');
                    }
                    else if (gems[target_id].hasClass('explosive') && !gems[chosen_id].hasClass('explosive')) {
                        gems[target_id].removeClass('explosive');
                        gems[chosen_id].addClass('explosive');
                    }

                    gems[target_id] = gems[chosen_id];
                    gems[chosen_id] = chosen_gem;

                    score_multiplier = 0;
                    await destroyPairs();
                }
                else {
                    playSound(bad_move);
                    gems[target_id] = gems[chosen_id];
                    gems[chosen_id] = chosen_gem;

                    chosen.removeClass('spinning').css('background-image', 'url("images/gems/' + chosen.attr('type') +
                        (chosen.attr('type') < 7 ? '.png")' : '.gif")')).addClass('moving_back');

                    switch (direction) {
                        case -8:
                            chosen.animate({ top: '0' }, 500, () =>
                                chosen.removeClass('moving_back'));
                            target.animate({ top: '0' }, 500, () =>
                                setClickable(true));
                            break;
                        case 8:
                            chosen.animate({ top: '0' }, 500, () =>
                                chosen.removeClass('moving_back'));
                            target.animate({ top: '0' }, 500, () =>
                                setClickable(true));
                            break;
                        case -1:
                            chosen.animate({ left: '0' }, 500, () =>
                                chosen.removeClass('moving_back'));
                            target.animate({ left: '0' }, 500, () =>
                                setClickable(true));
                            break;
                        case 1:
                            chosen.animate({ left: '0' }, 500, () =>
                                chosen.removeClass('moving_back'));
                            target.animate({ left: '0' }, 500, () =>
                                setClickable(true));
                            break;
                    }
                }
            }
            else {
                playSound(gem_grab);
                chosen.removeClass('spinning').css('background-image', 'url("images/gems/' + chosen.attr('type') +
                    (chosen.attr('type') < 7 ? '.png")' : '.gif")'));
                target.addClass('spinning').css('background-image', 'url("images/gems/' + target.attr('type') +
                    (target.attr('type') < 7 ? '.gif")' : '_.gif")'));
                spinning = true;
                setClickable(true);
            }
        }

        async function replacePairs() {
            do {
                gems.filter(g => g.hasClass('in_a_pair')).forEach(g => {
                    let random = Math.floor(Math.random() * 7);
                    g.css('background-image', 'url(images/gems/' + random + '.png)').removeClass('in_a_pair').attr('type', random);
                });
            } while (await scanForPairs());
            pairs = [];
        }

        async function scanForPairs(chosen_ids = []) {
            let index, pair;

            function pushPair() {
                if (pair.length > 2) {
                    let pair_index = pair.length === 4 && chosen_ids.length > 0 ?
                        (pair.includes(chosen_ids[0]) ? chosen_ids[0] : chosen_ids[1]) :
                        pair[Math.floor(pair.length / 2)];

                    pairs.push({i: pair_index, l: pair.length});
                    pair.forEach(p => gems[p].addClass('in_a_pair'));
                }
            }

            for (let i = 0; i < chosen_ids.length; i++)
                if (gems[chosen_ids[i]].attr('type') === '7') {
                    pairs.push({i: chosen_ids[i], l: gems[chosen_ids[i === 0 ? 1 : 0]].attr('type')});
                    gems[chosen_ids[i]].addClass('in_a_pair');
                    break;
                }

            for (let k = 0; k < 2; k++) {
                for (let i = 0; i < 8; i++) {
                    pair = [];

                    for (let j = 0; j < 8; j++) {
                        index = k === 0 ? (i * 8 + j) : (j * 8 + i);

                        if (pair.length === 0 || gems[(pair[0])].attr('type') === gems[index].attr('type'))
                            pair.push(index);
                        else {
                            pushPair();
                            pair = [];
                            pair.push(index);
                        }
                    }

                    pushPair();
                }
            }
            return $('.in_a_pair').length > 0;
        }

        async function destroyPairs() {
            pairs.forEach(p => {
                if (gems[p.i].attr('type') === '7') {
                    let gem_count = 0;
                    for (let i = 0; i < 64; i++)
                        if (p.l === '7' || gems[i].attr('type') === p.l) {
                            if (gems[i].attr('type') === '7')
                                power_cube_ids.push(i);

                            gems[i].addClass('in_a_pair');
                            gem_count++;

                            if (!gems[i].css('top').startsWith('0') || !gems[i].css('left').startsWith('0'))
                                gems[i].css({'top': '0px', 'left': '0px', 'background-image': 'url("images/gems/'+ p.l +
                                        '.png")'});
                        }

                    $('.in_a_pair.power_cube').removeClass('power_cube');
                    if (!power_cube_ids.includes(p.i))
                        power_cube_ids.push(p.i);

                    if (!gems[p.i].css('top').startsWith('0'))
                        gems[p.i].css('top', '0px');
                    else if (!gems[p.i].css('left').startsWith('0'))
                        gems[p.i].css('left', '0px');

                    gems[p.i].css('background-image', 'url("images/gems/7.gif")');

                    createDrawingArea();

                    if (gem_count < 64) {
                        let score = gem_count * 15 * ++score_multiplier;
                        let score_point_text = $('#canvas').find('div:nth-child(' + (p.i + 1) + ')').find('b').text(score);
                        score_point_text.animate({ top: '-80%', opacity: '0' }, 1000, () => score_point_text.css({
                            top: '0', opacity: '1' }).text(''));

                        gainScore(score, 'gems/7', gem_count, 5);
                    }
                    else {
                        for (let i = 1; i <= 64; i++) {
                            let score_point_text = $('#canvas').find('div:nth-child(' + i + ')').find('b').text(1000);
                            score_point_text.animate({ top: '-80%', opacity: '0' }, 1000, () => score_point_text.css({
                                top: '0', opacity: '1' }).text(''));
                        }

                        gainScore(1000, 'gems/7', gem_count, 10);
                    }

                    return;
                }

                if (score_multiplier === 0)
                    playSound(gem_pair);
                else
                    playSound(gem_combos[Math.min(score_multiplier, 4)]);
                let score = (p.l - 2 + Math.floor(p.l/5)) * 50 * ++score_multiplier;
                let score_point_text = $('#canvas').find('div:nth-child(' + (p.i + 1) + ')').find('b').text(score);
                score_point_text.animate({ top: '-80%', opacity: '0' }, 1000, () => score_point_text.css({
                    top: '0', opacity: '1' }).text(''));

                gainScore(score, 'gems/' + gems[p.i].attr('type'), p.l, p.l - 2);

                if (p.l === 4) {
                    gems[p.i].toggleClass('in_a_pair explosive');

                    if (gems[p.i].css('bottom').startsWith('-')) {
                        gems[p.i].css('top', '0');
                        gems[p.i + 8].css('top', '0');

                        gems[p.i].css('background-image', 'url("images/gems/' + gems[p.i].attr('type') +
                            (gems[p.i].attr('type') < 7 ? '.png")' : '.gif")'));
                        gems[p.i + 8].css('background-image', 'url("images/gems/' + gems[p.i + 8].attr('type') +
                            (gems[p.i + 8].attr('type') < 7 ? '.png")' : '.gif")'));
                    }
                    else if (gems[p.i].css('right').startsWith('-')) {
                        gems[p.i].css('left', '0');
                        gems[p.i + 1].css('left', '0');

                        gems[p.i].css('background-image', 'url("images/gems/' + gems[p.i].attr('type') +
                            (gems[p.i].attr('type') < 7 ? '.png")' : '.gif")'));
                        gems[p.i + 1].css('background-image', 'url("images/gems/' + gems[p.i + 1].attr('type') +
                            (gems[p.i + 1].attr('type') < 7 ? '.png")' : '.gif")'));
                    }
                }
                else if (p.l === 5) {
                    if (gems[p.i].css('bottom').startsWith('-'))
                        gems[p.i].css('top', '0');
                    else if (gems[p.i].css('right').startsWith('-'))
                        gems[p.i].css('left', '0');

                    gems[p.i].toggleClass('in_a_pair power_cube');
                    gems[p.i].attr('type', 7);
                    gems[p.i].css('background-image', 'url("images/gems/7.gif")');
                }
            });
            pairs = [];

            if (power_cube_ids.length === 0) {
                for (let i = 0; i < 64; i++)
                    if (gems[i].hasClass('in_a_pair'))
                        await hideGems(i);
                await replaceGems();
            }
            else {
                let delay = 50 / power_cube_ids.length;

                let context = drawing_area[0].getContext('2d');
                context.lineWidth = 10;
                let gradient = context.createLinearGradient(0, 0, 1000, 0);
                gradient.addColorStop(0, "#24a8e1");
                gradient.addColorStop(1, "#004965");
                context.strokeStyle = gradient;
                let imageData = context.getImageData(0, 0, drawing_area.width(), drawing_area.height());

                let scale = gems[0].width();
                let cube_x = (power_cube_ids[0] % 8) * scale + scale / 2
                let cube_y = Math.floor(power_cube_ids[0] / 8) * scale + scale / 2;

                async function forLoopWithDelay(i, wait_time) {
                    setTimeout(async () => {
                        if (i < 64 && gems[i].hasClass('in_a_pair')) {
                            if (!power_cube_ids.includes(i)) {
                                wait_time = delay;

                                let x = (i % 8) * scale + scale / 2, y = Math.floor(i / 8) * scale + scale / 2;

                                setTimeout(() => context.putImageData(imageData, 0, 0), delay);
                                playSound(power_cube_shoot);

                                context.beginPath();
                                context.moveTo(x, y);
                                context.lineTo(cube_x, cube_y);
                                context.stroke();

                                await hideGems(i);
                            }
                        }
                        else
                            wait_time = 0;

                        if (i === 63)
                            wait_time = 300;

                        if (++i < 65)
                            await forLoopWithDelay(i, wait_time);
                        else {
                            for (let j = 0; j < power_cube_ids.length; j++)
                                await hideGems(power_cube_ids[j]);
                            drawing_area.remove();
                            await replaceGems();
                        }
                    }, wait_time);
                }

                await forLoopWithDelay(0, delay);
            }
        }

        function createDrawingArea() {
            let game = $('#game');
            let canvas = $('#canvas');
            drawing_area = $('<canvas width="' + canvas.width() + '" height="' + canvas.height() +
                '" style="width: ' + canvas.width() + 'px; height: ' + canvas.height() + 'px;"</canvas>');
            game.append(drawing_area);
            let canvas_border_width = parseInt(canvas.css('border-width').split('p')[0], 10);
            drawing_area.offset({top: canvas.offset().top + canvas_border_width, left: canvas.offset().left +
                    canvas_border_width});
        }

        async function hideGems(i) {
            if (gems[i].hasClass('explosive')) {
                let explosion = $('<div class="explosion"></div>');
                let div = $('#canvas').find('div:nth-child(' + (i + 1) + ')');
                div.append(explosion);
                setTimeout(() => explosion.remove(), 400);
                gems[i].removeClass('explosive');
                playSound(bomb_explode);

                let gem_count = 0;
                for (let j = -1; j <= 1; j++) {
                    if (j === -1 && (i + j < 0 || i + j % 8 === 7) || j === 1 && i + j % 8 === 0)
                        continue;

                    for (let k = -1; k <= 1; k++) {
                        if (k === -1 && i + k * 8 < 0 || k === 1 && i + k * 8 > 63)
                            continue;

                        if (!gems[i + j + k * 8].hasClass('in_a_pair')) {
                            gems[i + j + k * 8].addClass('in_a_pair');
                            gem_count++;
                        }
                    }
                }

                let score = gem_count * 10 * ++score_multiplier;

                let score_point_text = div.find('b').text(score);
                score_point_text.animate({ top: '-80%', opacity: '0' }, 1000, () => score_point_text.css({
                    top: '0', opacity: '1' }).text(''));

                gainScore(score, 'explosion', gem_count, 2);

                i = 0;
            }

            let span = $('#canvas').find('div:nth-child(' + (i + 1) + ')').find('span');
            span.css({top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 'background-image': 'url("images/gems/' +
                    gems[i].attr('type') + (gems[i].attr('type') < 7 ? '.png")' : '.gif")')}).animate({
                width: '120%', height: '120%'
            }, 50, () => span.animate({
                width: '0%', height: '0%'
            }, 150, () => span.css({
                top: '-800%', left: '0%', transform: 'translate(0%, 0%)', width: '100%',
                height: '100%'
            })));
        }

        async function replaceGems() {
            $('.spinning, .moving_back, .in_a_pair').each(function () { $(this).removeClass(['spinning', 'moving_back', 'in_a_pair']); });

            if (power_cube_ids.length > 0)
                power_cube_ids = [];

            setTimeout(async () => {
                let delay_speeds = [0, 0, 0, 0, 0, 0, 0, 0];

                for (let i = 63; i >= 0; i--)
                    if (gems[i].css('top') !== '0px') {
                        let prev = i - 8, top = 1;
                        while (prev >= 0 && gems[prev].css('top') !== '0px') {
                            prev -= 8;
                            top++;
                        }

                        if (i < 8 || prev < 0) {
                            let random = Math.floor(Math.random() * 7);
                            gems[i].attr('type', random).css({'background-image': 'url("images/gems/' + random + '.png")',
                                'top': '-800%'}).animate({ top: '0' }, delay_speeds[i % 8]++ * 100);
                        }
                        else {
                            gems[i].attr('type', gems[prev].attr('type')).css({ 'background-image': 'url("images/gems/' +
                                    gems[prev].attr('type') + (gems[prev].attr('type') < 7 ? '.png")' : '.gif")'), 'top':
                                    -top + '00%'}).animate({ top: '0' }, ++delay_speeds[i % 8] * 100);
                            gems[prev].css('top', '-1000%');

                            if (gems[prev].hasClass('explosive')) {
                                gems[prev].removeClass('explosive');
                                gems[i].addClass('explosive');
                            }

                            if (gems[prev].hasClass('power_cube')) {
                                gems[prev].removeClass('power_cube');
                                gems[i].addClass('power_cube');
                            }
                        }
                    }

                gemFall(Math.max(...delay_speeds));

                setTimeout(async () => {
                    if (await scanForPairs())
                        await destroyPairs();
                    else
                        setClickable(true);
                }, 200 + Math.max(...delay_speeds) * 100);
            }, 200);
        }

        function gainScore(s, type, length, time_bonus) {
            let elements = $('.history_element');
            elements.each(function (i) { $(this).css('opacity', 1 - i / 11.25) });

            if (elements.length >= 10)
                history.find('.history_element:last').remove();

            let history_element = createHistoryElement(type, length, s, time_bonus);
            history.prepend(history_element);

            changeTime(time_bonus);

            score += s;
            score_text.text(score);

            if (score_text.text().length > 4)
                score_text.css({'height': '22.5%','font-size': '4vh'});
            else if (score_text.text().length > 3)
                score_text.css({'height': '25%','font-size': '5vh'});
        }

        function changeTime(t) {
            time += t;
            timer.css('width', Math.min(time * (10 / 6), 100) + '%');
            timer_text.text(Math.ceil(time) + 's');
        }

        function createHistoryElement(type, length, score, time_bonus) {
            let history_element = $('<div class="history_element"></div>');
            let gem_icon_url = 'images/' + type + '.png';
            $('<div class="gem_icon" style="background-image: url(' + gem_icon_url + ')"></div>').appendTo(history_element);
            $((length < 10 ? '<div>x' : '<div>') + length + '</div>').appendTo(history_element);
            $('<div>+' + score + '</div>').appendTo(history_element);
            $('<div>+' + time_bonus + 's</div>').appendTo(history_element);
            return history_element;
        }

        function gameOver() {
            clearInterval(interval);
            playSound(announcer[3]);
            timer_text.text('0s');
            setClickable(false);
            if (spinning) {
                spinning = false;
                let spinning_gem = $('.spinning');
                spinning_gem.removeClass('spinning').css('background-image', 'url("images/gems/' +
                    spinning_gem.attr('type') + (spinning_gem.attr('type') < 7 ? '.png")' : '.gif")'));
            }

            let db = localStorage.getItem('database'), place = 11;
            if (db === 'null' || db === null) {
                localStorage.setItem('database', player_name + '\\' + score + '\n');
                place = 1;
            }
            else {
                db = db.split('\n');
                db.pop();

                for (let i = db.length - 1; i >= 0; i--) {
                    db[i] = db[i].split('\\');
                    db[i][1] = parseInt(db[i][1], 10);

                    if (db[i][1] < score) {
                        if (i < 9)
                            if (i === db.length - 1)
                                db.push(db[i]);
                            else
                                db[i + 1] = db[i];

                        db[i] = [player_name, score];
                        place = i + 1;
                    }
                }

                if (place === 11 && db.length < 10) {
                    place = db.length;
                    db.push([player_name, score]);
                }

                let database = '';
                db.forEach(d => database += d[0] + '\\' + d[1] + '\n');
                localStorage.setItem('database', database);
            }

            setLeaderboard();

            game_over.find('div:nth-child(2)').text('Score: ' + score);

            shadow.css('display', 'block').animate({opacity: '1'}, 500);
            game_over.css({top: '150%', display: 'block'}).animate({top: '50%', opacity: '1'}, 2000, () => {
                if (place <= 3) playSound(announcer[6]);
                else if (place < 6) playSound(announcer[5]);
                else if (place < 11) playSound(announcer[4]);
                if (place < 11) spoke = true;
            });
        }
    }
});