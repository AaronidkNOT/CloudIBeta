document.addEventListener('DOMContentLoaded', function () {

    const botonMenuMovil = document.getElementById('boton-menu-movil');
    const menuMovil = document.getElementById('menu-movil');

    if (botonMenuMovil && menuMovil) {
        const enlacesNavegacionMovil = menuMovil.querySelectorAll('a');

        botonMenuMovil.addEventListener('click', function () {
            // ANTES: menuMovil.classList.toggle('hidden');
            menuMovil.classList.toggle('menu-movil-abierto'); // <--- CAMBIO AQUÍ

            const estaExpandido = botonMenuMovil.getAttribute('aria-expanded') === 'true' || false;
            botonMenuMovil.setAttribute('aria-expanded', !estaExpandido);

            // La condición para el ícono ahora se basa en la nueva clase
            const rutaIcono = menuMovil.classList.contains('menu-movil-abierto') // <--- CAMBIO AQUÍ
                ? "M6 18L18 6M6 6l12 12" // Ícono X (abierto)
                : "M4 6h16M4 12h16m-7 6h7"; // Ícono Hamburguesa (cerrado)
            const iconoSVG = botonMenuMovil.querySelector('svg path');
            if (iconoSVG) {
                iconoSVG.setAttribute('d', rutaIcono);
            }
        });

        enlacesNavegacionMovil.forEach(enlace => {
            enlace.addEventListener('click', () => {
                // ANTES: menuMovil.classList.add('hidden');
                menuMovil.classList.remove('menu-movil-abierto'); // <--- CAMBIO AQUÍ
                
                const iconoSVG = botonMenuMovil.querySelector('svg path');
                if (iconoSVG) {
                    iconoSVG.setAttribute('d', "M4 6h16M4 12h16m-7 6h7"); // Reset a hamburguesa
                }
                botonMenuMovil.setAttribute('aria-expanded', 'false');
            });
        });
    }
});

    const spanAnioActual = document.getElementById('anioActual');
    if (spanAnioActual) {
        spanAnioActual.textContent = new Date().getFullYear();
    }

    const spanUltimaActualizacion = document.getElementById('ultimaActualizacion');
    if (spanUltimaActualizacion) {
        spanUltimaActualizacion.textContent = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const elementosAnimados = document.querySelectorAll('.elemento-animado');

    if (elementosAnimados.length > 0) {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('es-visible');
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1 });

        elementosAnimados.forEach(item => {
            observador.observe(item);
        });
    }

    const encabezado = document.getElementById('encabezado');
    if (encabezado) {
        let ultimaPosicionScroll = 0;
        window.addEventListener('scroll', function() {
            let posicionScrollActual = window.pageYOffset || document.documentElement.scrollTop;

            if (posicionScrollActual > 80) {
                encabezado.classList.add('barra-navegacion-scrolled');
            } else {
                encabezado.classList.remove('barra-navegacion-scrolled');
            }

            ultimaPosicionScroll = posicionScrollActual <= 0 ? 0 : posicionScrollActual;
        }, false);
    }

    const botonesInterruptorTema = document.querySelectorAll('.boton-interruptor-tema');

    const iconoSol = `<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.071a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
    const iconoLuna = `<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>`;

    function actualizarIconosInterruptorTema(esTemaClaro) {
        botonesInterruptorTema.forEach(boton => {
            boton.innerHTML = esTemaClaro ? iconoLuna : iconoSol;
        });
    }

    let temaActual = localStorage.getItem('tema');
    if (temaActual === 'light') {
        document.documentElement.classList.add('tema-claro');
        actualizarIconosInterruptorTema(true);
    } else {
        document.documentElement.classList.remove('tema-claro');
        actualizarIconosInterruptorTema(false);
        if (!temaActual) {
            localStorage.setItem('tema', 'dark');
        }
    }

    botonesInterruptorTema.forEach(botonInterruptor => {
        if (botonInterruptor) {
            botonInterruptor.addEventListener('click', function() {
                document.documentElement.classList.toggle('tema-claro');
                const esTemaClaro = document.documentElement.classList.contains('tema-claro');
                localStorage.setItem('tema', esTemaClaro ? 'light' : 'dark');
                actualizarIconosInterruptorTema(esTemaClaro);
            });
        }
    });