let today = new Date(), year = today.getFullYear(), month = today.getMonth() + 1, day = today.getDate();

if (month < 2)
    document.getElementById('age').innerHTML = (year - 2002).toString();
else if (month > 2)
    document.getElementById('age').innerHTML = (year - 2001).toString();
else {
    if (day < 5)
        document.getElementById('age').innerHTML = (year - 2002).toString();
    else
        document.getElementById('age').innerHTML = (year - 2001).toString();
}

function copy() {
    const id = 'tooltip';
    navigator.clipboard.writeText('$mitE#5364');

    document.getElementById(id).style.opacity = '1';
    document.getElementById(id).style.visibility = 'visible';

    new Promise(resolve => setTimeout(resolve, 1200)).then(() => {
        document.getElementById(id).style.opacity = '0';
        new Promise(resolve => setTimeout(resolve, 300)).then(() =>
            document.getElementById(id).style.visibility = 'hidden');
    });
}