document.addEventListener('DOMContentLoaded', function() {

    // Animación para el título principal, letra por letra (opcional, más vistoso)
    const mainTitle = document.querySelector('.main-title');
    const originalText = mainTitle.textContent;
    mainTitle.textContent = ''; // Limpiamos el texto original

    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            mainTitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 120); // Velocidad de escritura
        }
    }
    setTimeout(typeWriter, 500);


    // Mostrar la vista previa del mapa después de un tiempo
    const mapPreview = document.getElementById('mapPreview');
    if (mapPreview) {
        setTimeout(() => {
            mapPreview.classList.add('show');
        }, 2000); // Muestra la preview después de 2 segundos
    }
});