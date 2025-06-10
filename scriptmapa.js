document.addEventListener('DOMContentLoaded', function() {

    const mainTitle = document.querySelector('.main-title');
    const originalText = mainTitle.textContent;
    mainTitle.textContent = '';

    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            mainTitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 120);
        }
    }
    setTimeout(typeWriter, 500);

    const mapPreview = document.getElementById('mapPreview');
    if (mapPreview) {
        setTimeout(() => {
            mapPreview.classList.add('show');
        }, 2000);
    }
});
