const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('download') === 'true')
    document.getElementById('download-link').click();