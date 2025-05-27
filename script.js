// Espera a que todo el contenido del DOM (la estructura HTML) esté completamente cargado y parseado.
document.addEventListener('DOMContentLoaded', function () {

    // --- MANEJO DEL MENÚ MÓVIL ---
    // Obtener el botón que abre/cierra el menú móvil y el menú móvil en sí.
    const botonMenuMovil = document.getElementById('boton-menu-movil'); // Traducido de 'mobile-menu-button'
    const menuMovil = document.getElementById('menu-movil');             // Traducido de 'mobile-menu'

    // Verificar que ambos elementos existan antes de continuar.
    if (botonMenuMovil && menuMovil) {
        // Obtener todos los enlaces de navegación dentro del menú móvil.
        const enlacesNavegacionMovil = menuMovil.querySelectorAll('a');

        // Añadir un evento 'click' al botón del menú móvil.
        botonMenuMovil.addEventListener('click', function () {
            // Alternar la clase 'hidden' (de Tailwind) para mostrar/ocultar el menú.
            menuMovil.classList.toggle('hidden');

            // Actualizar el atributo 'aria-expanded' para accesibilidad.
            // Indica si el menú está expandido o no.
            const estaExpandido = botonMenuMovil.getAttribute('aria-expanded') === 'true' || false;
            botonMenuMovil.setAttribute('aria-expanded', !estaExpandido);

            // Cambiar el ícono del botón (hamburguesa <-> X) según el estado del menú.
            // Los valores de 'd' son las rutas SVG para los íconos.
            const rutaIcono = menuMovil.classList.contains('hidden')
                ? "M4 6h16M4 12h16m-7 6h7" // Ícono de hamburguesa
                : "M6 18L18 6M6 6l12 12";    // Ícono de X (cerrar)
            const iconoSVG = botonMenuMovil.querySelector('svg path');
            if (iconoSVG) {
                iconoSVG.setAttribute('d', rutaIcono);
            }
        });

        // Añadir un evento 'click' a cada enlace dentro del menú móvil.
        // Esto es para cerrar el menú cuando se selecciona una opción.
        enlacesNavegacionMovil.forEach(enlace => {
            enlace.addEventListener('click', () => {
                // Ocultar el menú.
                menuMovil.classList.add('hidden');
                // Restaurar el ícono de hamburguesa en el botón.
                const iconoSVG = botonMenuMovil.querySelector('svg path');
                if (iconoSVG) {
                    iconoSVG.setAttribute('d', "M4 6h16M4 12h16m-7 6h7");
                }
                // Actualizar 'aria-expanded' a 'false' (cerrado).
                botonMenuMovil.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- ACTUALIZAR EL AÑO ACTUAL EN EL PIE DE PÁGINA ---
    // Obtener el elemento span donde se mostrará el año.
    const spanAnioActual = document.getElementById('anioActual'); // Traducido de 'currentYear'
    if (spanAnioActual) {
        // Establecer el contenido de texto del span con el año actual.
        spanAnioActual.textContent = new Date().getFullYear();
    }

    // --- ACTUALIZAR LA FECHA DE "ÚLTIMA ACTUALIZACIÓN" (si existe) ---
    // Esta parte es nueva, basada en tu segundo bloque de JS.
    const spanUltimaActualizacion = document.getElementById('ultimaActualizacion'); // Traducido de 'lastUpdated'
    if (spanUltimaActualizacion) {
        // Formatear la fecha actual al formato español (día de mes de año).
        spanUltimaActualizacion.textContent = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // --- ANIMACIÓN DE ELEMENTOS AL HACER SCROLL (INTERSECTION OBSERVER) ---
    // Obtener todos los elementos que tienen la clase 'elemento-animado'.
    const elementosAnimados = document.querySelectorAll('.elemento-animado'); // Traducido de '.animated-item'

    // Si existen elementos para animar.
    if (elementosAnimados.length > 0) {
        // Crear un observador de intersección.
        // Este observador vigila cuándo los elementos entran en la vista.
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                // Si el elemento está intersectando (visible en pantalla).
                if (entrada.isIntersecting) {
                    // Añadir la clase 'es-visible' para activar la animación CSS.
                    entrada.target.classList.add('es-visible'); // Traducido de 'is-visible'
                    // Dejar de observar este elemento una vez que ha sido animado.
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1 }); // El umbral de 0.1 significa que la animación se activa cuando el 10% del elemento es visible.

        // Hacer que el observador vigile cada uno de los elementos animados.
        elementosAnimados.forEach(item => {
            observador.observe(item);
        });
    }

    // --- CAMBIO DE ESTILO DEL ENCABEZADO AL HACER SCROLL ---
    // Obtener el elemento del encabezado.
    const encabezado = document.getElementById('encabezado'); // Traducido de 'header'
    if (encabezado) {
        let ultimaPosicionScroll = 0;
        // Añadir un evento 'scroll' a la ventana.
        window.addEventListener('scroll', function() {
            // Obtener la posición actual del scroll vertical.
            let posicionScrollActual = window.pageYOffset || document.documentElement.scrollTop;

            // Lógica de tu primer script (cambio de background-color directo):
            /*
            if (posicionScrollActual > ultimaPosicionScroll && posicionScrollActual > 80) {
                // Si se hace scroll hacia abajo y se ha pasado de 80px.
                encabezado.style.backgroundColor = 'rgba(15, 23, 42, 0.95)'; // Más opaco
            } else {
                 // Si se hace scroll hacia arriba o no se ha pasado de 80px.
                 if (posicionScrollActual <= 80) {
                    encabezado.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'; // Opacidad original
                 }
            }
            */

            // Lógica de tu segundo script (usando una clase CSS):
            // Esta es generalmente una mejor práctica, ya que mantiene los estilos en CSS.
            if (posicionScrollActual > 80) {
                // Si se ha hecho scroll más de 80px hacia abajo.
                encabezado.classList.add('barra-navegacion-scrolled'); // Asume que tienes una clase CSS 'navbar-scrolled' o 'barra-navegacion-scrolled'
            } else {
                // Si el scroll está por encima de 80px o en la parte superior.
                encabezado.classList.remove('barra-navegacion-scrolled');
            }

            // Actualizar la última posición de scroll.
            ultimaPosicionScroll = posicionScrollActual <= 0 ? 0 : posicionScrollActual;
        }, false);
    }

    // --- MANEJO DEL INTERRUPTOR DE TEMA (CLARO/OSCURO) ---
    // Obtener todos los botones que cambian el tema.
    const botonesInterruptorTema = document.querySelectorAll('.boton-interruptor-tema'); // Traducido de '.theme-toggle-button'

    // Definir los íconos SVG para sol y luna como cadenas de texto.
    const iconoSol = `<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.071a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
    const iconoLuna = `<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>`;

    // Función para actualizar el ícono en todos los botones de cambio de tema.
    function actualizarIconosInterruptorTema(esTemaClaro) {
        botonesInterruptorTema.forEach(boton => {
            boton.innerHTML = esTemaClaro ? iconoLuna : iconoSol; // Si es tema claro, muestra la luna (para cambiar a oscuro), y viceversa.
        });
    }

    // Cargar el tema guardado en localStorage (si existe) o establecer el tema oscuro por defecto.
    let temaActual = localStorage.getItem('tema');
    if (temaActual === 'light') { // 'light' es el valor que guardas
        document.documentElement.classList.add('tema-claro'); // Traducido de 'light-theme'
        actualizarIconosInterruptorTema(true); // Indicar que es tema claro
    } else {
        // Por defecto o si es 'dark'
        document.documentElement.classList.remove('tema-claro');
        actualizarIconosInterruptorTema(false); // Indicar que es tema oscuro
        if (!temaActual) { // Si no había nada guardado, lo establecemos a oscuro por defecto
            localStorage.setItem('tema', 'dark'); // 'dark' es el valor que guardas
        }
    }

    // Añadir un evento 'click' a cada botón de cambio de tema.
    botonesInterruptorTema.forEach(botonInterruptor => {
        if (botonInterruptor) {
            botonInterruptor.addEventListener('click', function() {
                // Alternar la clase 'tema-claro' en el elemento <html>.
                document.documentElement.classList.toggle('tema-claro');
                // Comprobar si el tema claro está activo después del cambio.
                const esTemaClaro = document.documentElement.classList.contains('tema-claro');
                // Guardar la preferencia del tema en localStorage.
                localStorage.setItem('tema', esTemaClaro ? 'light' : 'dark');
                // Actualizar los íconos.
                actualizarIconosInterruptorTema(esTemaClaro);
            });
        }
    });
});