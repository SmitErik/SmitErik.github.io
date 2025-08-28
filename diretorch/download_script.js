const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('download') === 'true') {
    const direTorchSetup = "https://github.com/SmitErik/SmitErik.github.io/releases/download/diretorch_v1.1/DireTorchSetup.exe";

    const link = document.createElement('a');
    link.href = direTorchSetup;
    link.download = direTorchSetup.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}