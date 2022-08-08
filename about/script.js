function copy(text) {
    if (text === 'e')
        navigator.clipboard.writeText('eriksmit2001@gmail.com');
    else if (text === 'd')
        navigator.clipboard.writeText('$mitE#5364');

    document.getElementById(text).style.opacity = '1';
    document.getElementById(text).style.visibility = 'visible';

    new Promise(resolve => setTimeout(resolve, 1200)).then(() => {
        document.getElementById(text).style.opacity = '0';

        new Promise(resolve => setTimeout(resolve, 300)).then(() => document.getElementById(text).style.visibility = 'hidden');
    });
}