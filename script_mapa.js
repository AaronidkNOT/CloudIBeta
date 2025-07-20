document.addEventListener('DOMContentLoaded', function () {
    const initialCoordinates = [-37.1789, -62.7588]; // Carhué
    const initialZoom = 14;
    let activeMarker = null;
    let map;

    // --- ELEMENTOS DEL DOM (CACHEADOS) ---
    let routeInstructions = []; // instrucciones activas

    const searchPanel = document.querySelector('.search-panel');
    const searchInput = document.getElementById('search-input');
    const searchResultsEl = document.getElementById('search-results');
    const infoPanel = document.getElementById('info-panel');
    const siteNameEl = document.getElementById('site-name');
    const siteImageEl = document.getElementById('site-image');
    const siteTypeEl = document.getElementById('site-type');
    const siteContactEl = document.getElementById('site-contact');
    const siteHoursEl = document.getElementById('site-hours');
    const siteDescriptionEl = document.getElementById('site-description');
    const reviewsListEl = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('review-form');
    const currentSiteIdInput = document.getElementById('current-site-id');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const locateMeButton = document.getElementById('fab-locate-me');
    const toggleSearchBtn = document.getElementById('toggle-search-btn');
    const estadoRutaEl = document.getElementById('estadoRuta');
    const rutaAutoBtn = document.getElementById('rutaAuto');

    // --- DATOS Y ESTADO ---
    let sitesData = [];
    let allReviews = {};
    let markers = {};
    let routingControl = null;
    let selectedDestinationCoords = null;
    let userCurrentCoords = null;
    let myLocationMarker = null;
    let myLocationAccuracyCircle = null;
    let visibleSiteMarker = null;
    let locationWatchId = null;

    // --- VARIABLES Y FUNCIONES PARA SÍNTESIS DE VOZ ---
    let speechSynth = null; // Variable para el sintetizador de voz, inicializada en onvoiceschanged
    let spanishVoice = null; // Variable para almacenar la voz en español seleccionada

    // Función para hablar una instrucción individual (puede cancelar la anterior)
    function speakInstruction(text) {
        if (!('speechSynthesis' in window) || speechSynth === null) {
            console.warn("API de Síntesis de Voz no disponible o no inicializada.");
            return;
        }

        // Si ya está hablando algo, lo cancelamos para que diga lo nuevo
        if (speechSynth.speaking) {
            speechSynth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // Idioma español de España por defecto

        // Asignar la voz en español si ya la hemos encontrado
        if (spanishVoice) {
            utterance.voice = spanishVoice;
            console.log("Usando voz:", spanishVoice.name, spanishVoice.lang);
        } else {
            console.warn("No se encontró una voz específica en español, usando voz por defecto del navegador para 'es-ES'.");
        }
        
        utterance.onerror = (event) => {
            console.error('Error en la síntesis de voz:', event.error);
        };

        speechSynth.speak(utterance);
    }
    function traducirInstruccion(texto) {
    if (!texto || typeof texto !== 'string') return texto;

    return texto
        .replace(/^Head southeast\b/i, "Dirígete hacia el sureste")
        .replace(/^Head northeast\b/i, "Dirígete hacia el noreste")
        .replace(/^Head north\b/i, "Dirígete hacia el norte")
        .replace(/^Head south\b/i, "Dirígete hacia el sur")
        .replace(/^Head east\b/i, "Dirígete hacia el este")
        .replace(/^Head west\b/i, "Dirígete hacia el oeste")

        .replace(/^Turn right\b/i, "Gira a la derecha")
        .replace(/^Turn left\b/i, "Gira a la izquierda")

        .replace(/^Enter the traffic circle and take the (\d)(st|nd|rd|th) exit onto (.+)/i, "Entra a la rotonda y toma la $1ᵃ salida hacia $3")
        .replace(/^Exit the traffic circle onto (.+)/i, "Sal de la rotonda hacia $1")
        .replace(/^Enter the traffic circle and take the (\d)(st|nd|rd|th) exit\b/i, "Entra a la rotonda y toma la $1ᵃ salida")
        .replace(/^Exit the traffic circle\b/i, "Sal de la rotonda")

        .replace(/^You have arrived at your destination, on the right/i, "Has llegado a tu destino, a la derecha")
        .replace(/^You have arrived at your destination, on the left/i, "Has llegado a tu destino, a la izquierda")
        .replace(/^You have arrived at your destination\b/i, "Has llegado a tu destino");
}

    // NUEVA FUNCIÓN: Para hablar una secuencia de instrucciones sin interrupciones
    function speakInstructionSequentially(instructions, index) {
        if (index >= instructions.length) {
            console.log("Todas las instrucciones han sido habladas.");
            return; // Todas las instrucciones han terminado
        }

        const rawText = instructions[index].text;

// Ignorar si es de una rotonda
if (/traffic circle/i.test(rawText)) {
    console.log("Saltando instrucción de rotonda:", rawText);
    speakInstructionSequentially(instructions, index + 1);
    return;
}

const currentInstructionText = traducirInstruccion(rawText);


        console.log("Hablando instrucción secuencial:", currentInstructionText); // Para depuración
        
        if (!('speechSynthesis' in window) || speechSynth === null) {
            console.warn("API de Síntesis de Voz no disponible o no inicializada para secuencia.");
            return;
        }

        // NO usamos speechSynth.cancel() aquí para no interrumpir la secuencia interna.
        const utterance = new SpeechSynthesisUtterance(currentInstructionText);
        utterance.lang = 'es-ES';

        if (spanishVoice) {
            utterance.voice = spanishVoice;
        } else {
            console.warn("No se encontró una voz específica en español, usando voz por defecto del navegador para 'es-ES'.");
        }

        utterance.onerror = (event) => {
            console.error('Error en la síntesis de voz (secuencial):', event.error);
        };

        // CUANDO UNA INSTRUCCIÓN TERMINA, LLAMA A SÍ MISMA PARA HABLAR LA SIGUIENTE
        utterance.onend = () => {
            speakInstructionSequentially(instructions, index + 1);
        };

        speechSynth.speak(utterance);
    }


    // Inicializar el sintetizador de voz y seleccionar la voz en español
    window.speechSynthesis.onvoiceschanged = () => {
        speechSynth = window.speechSynthesis;
        const voices = speechSynth.getVoices();
        
        // --- Estrategia de selección de voz ---
        // 1. Intentar encontrar una voz de Google en español de España
        spanishVoice = voices.find(voice => voice.lang === 'es-ES' && voice.name.includes('Google español'));

        // 2. Si no se encuentra, buscar cualquier voz de Google en español
        if (!spanishVoice) {
            spanishVoice = voices.find(voice => voice.lang.startsWith('es') && voice.name.includes('Google español'));
        }

        // 3. Si aún no se encuentra, buscar una voz de Microsoft Helena (común en Windows)
        if (!spanishVoice) {
            spanishVoice = voices.find(voice => voice.lang === 'es-ES' && voice.name.includes('Microsoft Helena'));
        }

        // 4. Si aún no se encuentra, buscar cualquier voz de español de España
        if (!spanishVoice) {
            spanishVoice = voices.find(voice => voice.lang === 'es-ES');
        }

        // 5. Si aún no se encuentra, buscar cualquier voz en español
        if (!spanishVoice) {
            spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
        }

        if (spanishVoice) {
            console.log("Voz en español seleccionada:", spanishVoice.name, spanishVoice.lang);
        } else {
            console.warn("No se encontró ninguna voz en español en el navegador. Se usará la voz por defecto.");
        }
    };
    // --- FIN VARIABLES Y FUNCIONES PARA SÍNTESIS DE VOZ ---

    // --- INICIALIZACIÓN ---
    function init() {
        loadSitesData();
        loadReviews();
        initMap();
        setupEventListeners();
        renderSearchResults(sitesData);
        hideInfoPanel();
        hideSearchPanel();
        requestUserLocationOnce(); 
    }

    function loadSitesData() {
        sitesData = [
            { id: 'ruinasEpecuen', name: 'Ruinas de Villa Epecuén', type: 'Atracción Turística', coordinates: [-37.1335, -62.8080], description: 'Impresionantes ruinas de la villa turística que fue inundada en 1985. Un testimonio de la fuerza de la naturaleza y la historia local.', image: 'imagenes/epecuen.jpg', contact: 'No aplica', hours: 'Abierto siempre (visita exterior)' },
            { id: 'playaEcoSustentable', name: 'Playa Eco Sustentable', type: 'Atracción Turística', coordinates: [-37.139138, -62.795155], description: 'Espacio recreativo a orillas del Lago Epecuén, conocido por sus propiedades terapéuticas y su enfoque en la sostenibilidad.', image: 'imagenes/ecoplaya.jpg', contact: 'Consultar en Oficina de Turismo', hours: 'Abierto siempre (visita exterior)' },
            { id: 'museoRegionalCarhue', name: 'Museo Regional Adolfo Alsina', type: 'Cultura y Ocio', coordinates: [-37.18094233530074, -62.761820746051036], description: 'Conserva la historia y el patrimonio cultural de Carhué y la región de Adolfo Alsina.', image: 'imagenes/museo.jpg', contact: '(02936) 43-0660', hours: 'Lunes a Viernes: 7-13hs. Sábados y Domingos: 9-13hs.' },
            { id: 'cine', name: 'Cine Carhué', type: 'Cultura y Ocio', coordinates: [-37.17889807646663, -62.76050571327587], description: 'Cine local con películas actuales y eventos especiales.', image: 'imagenes/cine.jpg', contact: 'Consultar en el Lugar', hours: 'Consultar programación' },
            { id: 'panaderiaMiSueño', name: 'Panaderia Mi Sueño', type: 'Gastronomía', coordinates: [-37.176980, -62.756694], description: 'Panaderia tradiccional, Amigable por su bajo precio.', image: 'imagenes/panaderia_misueno.jpg', contact: 'Consultar en el Lugar', hours: 'Todos los días: 7-13hs, 16-20hs' },
            { id: 'amoratacafe', name: 'Amorata Café', type: 'Gastronomía', coordinates: [-37.1790450310919, -62.76081465973938], description: 'Cafetería acogedora con opciones de repostería y café.', image: 'imagenes/amoratacarhue.webp', contact: 'Consultar en el Lugar', hours: 'Martes a Viernes: 9-21:30hs, 9:30-21:30hs' },
            { id: 'lataperacafe', name: 'La Taperacafé', type: 'Gastronomía', coordinates: [-37.17871163427988, -62.75727335494652], description: 'Cafetería con un ambiente relajado y opciones de comida rápida.', image: 'imagenes/latapera.jpg', contact: '(02923) 48-7502', hours: 'Lunes: 8hs-hasta cerrar, Jueves a Domingo: 8hs-hasta cerrar' },
            { id: 'hotelCarhue', name: 'Gran Hotel Carhué', type: 'Alojamiento', coordinates: [-37.18035822449324, -62.75878270822948], description: 'Alojamiento céntrico con servicios completos.', image: 'imagenes/granhotel.jpg', contact: '(02936) 43-0440', hours: 'Recepción 24hs' },
            { id: 'farmaciaDiaz', name: 'Farmacia Díaz', type: 'Salud y Servicios', coordinates: [-37.17737809194196, -62.754341006246776], description: 'Farmacia tradicional con atención personalizada.', image: 'imagenes/farmaciadiaz.jpg', contact: '(02936) 41-0287', hours: 'Lunes a Viernes: 8:30-12:30hs, 16-20:30hs. Sabados: 9-12:30 (Verificar si esta de turno)' },
            { id: 'farmaciasarsur', name: 'Farmacia Sar Sur', type: 'Salud y Servicios', coordinates: [-37.178973445003656, -62.75185701791286], description: 'Farmacia con atención personalizada y productos de salud.', image: 'imagenes/farmaciasarsur.jpeg', contact: '(02936) 41-2231', hours: 'Lunes a Viernes: 8-20:30hs, Sábados: 8-12:30hs (Verificar si esta de turno)' },
            { id: 'farmaciadecarhue', name: 'Farmacia de carhue', type: 'Salud y Servicios', coordinates: [-37.18181224279205, -62.76084910071841], description: 'Farmacia tradicional con atención personalizada y productos de salud.', image: 'imagenes/farmaciacarhue.jpg', contact: '(02936) 43-2662', hours: 'Lunes a Sabados: 8-12:30hs, 16-20hs (Verificar si esta de turno)' },
            { id: 'farmaciaportela', name: 'Farmacia Portela', type: 'Salud y Servicios', coordinates: [-37.17841073467453, -62.757621102370145], description: 'Farmacia moderna con buena atención y productos de salud buenos.', image: 'imagenes/farmaciaportela.jpg', contact: 'Consultar en local', hours: 'Lunes a Sabados: 8-12:30hs, 16-20hs (Verificar si esta de turno)' },
            { id: 'hospital', name: 'Hospital Municipal San Martín', type: 'Salud y Servicios', coordinates: [-37.17716908345923, -62.74984961493429], description: 'Centro de salud local con atención médica general y especializada.', image: 'imagenes/hospitalcarhue.jpg', contact: '(02936) 43-2222 (Emergencias:107)', hours: 'Emergencias 24hs, Consultas de lunes a viernes 8-20hs' },
            { id: 'consultorio', name: 'Consultorio Médico Urquiza', type: 'Salud y Servicios', coordinates: [-37.17585319956292, -62.76382760428685], description: 'Consultorio médico con atención general y especialidades.', image: 'imagenes/consultorioUrquiza.jpg', contact: '(02923) 69-8097', hours: 'Lunes a Viernes: 8:30-12hs, 15-18hs' },
        ];
    }

    function loadReviews() {
        try {
            const storedReviews = localStorage.getItem('siteReviews');
            allReviews = storedReviews ? JSON.parse(storedReviews) : {};
        } catch (error) {
            console.error("Error al cargar reseñas desde localStorage:", error);
            allReviews = {};
        }
    }

    function saveReviews() {
        try {
            localStorage.setItem('siteReviews', JSON.stringify(allReviews));
        } catch (error) {
            console.error("Error al guardar reseñas en localStorage:", error);
        }
    }

    function initMap() {
        map = L.map('map', {
            zoomControl: false,
            layersControl: false,
            maxZoom: 18 // Se estableció un maxZoom para reflejar el límite de OSM
        }).setView(initialCoordinates, initialZoom);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Proyecto <a href="https://aaronidknot.github.io/CloudI/" target="_blank">CloudI</a>'
        }).addTo(map);

        sitesData.forEach(addMarkerForSite);
    }

    function setupEventListeners() {
        if (closePanelBtn) closePanelBtn.addEventListener('click', hideInfoPanel);
        if (reviewForm) reviewForm.addEventListener('submit', handleReviewSubmit);
        if (searchInput) searchInput.addEventListener('input', handleSearchInput);
        
        if (toggleSearchBtn) {
            toggleSearchBtn.addEventListener('click', () => {
                searchPanel.classList.toggle('active');
                if (searchPanel.classList.contains('active')) {
                    hideInfoPanel();
                }
            });
        }
        
        if (locateMeButton) {
            locateMeButton.addEventListener('click', function() {
                hideInfoPanel();
                hideSearchPanel();
                startWatchingUserLocation();
            });
        }
        
        map.on('click', () => {
            hideInfoPanel();
            hideSearchPanel();
        });

        if (rutaAutoBtn) rutaAutoBtn.addEventListener('click', () => mostrarRuta('driving'));
        
        window.addEventListener('beforeunload', () => {
            if (locationWatchId) {
                navigator.geolocation.clearWatch(locationWatchId);
            }
        });
    }

    function addMarkerForSite(site) {
        if (!site.coordinates || site.coordinates.length !== 2) {
            console.warn(`Sitio "${site.name}" no tiene coordenadas válidas.`);
            return;
        }
        const marker = L.marker(site.coordinates); 
        marker.on('click', () => selectSiteFromMarker(site));
        markers[site.id] = marker;
    }

    function hideInfoPanel() {
        infoPanel.classList.add('hidden');
        infoPanel.setAttribute('aria-hidden', 'true');
        unhighlightActiveMarker();
        updateActiveSearchResult(null);

        if (visibleSiteMarker && !routingControl) {
            map.removeLayer(visibleSiteMarker);
            visibleSiteMarker = null;
        }
    }

    function showSearchPanel() { if (searchPanel) searchPanel.classList.add('active'); }
    function hideSearchPanel() { if (searchPanel) searchPanel.classList.remove('active'); }

    function displaySiteInfo(site) {
        siteNameEl.textContent = site.name;
        siteImageEl.src = site.image || 'imagenes/placeholder.png';
        siteImageEl.alt = `Imagen de ${site.name}`;
        siteTypeEl.textContent = site.type || 'No especificado';
        siteContactEl.textContent = site.contact || 'No disponible';
        siteHoursEl.textContent = site.hours || 'Consultar';
        siteDescriptionEl.innerHTML = site.description ? escapeHTML(site.description).replace(/\n/g, '<br>') : 'Descripción no disponible.';
        
        currentSiteIdInput.value = site.id;
        displayReviews(site.id);
        
        infoPanel.classList.remove('hidden');
        infoPanel.setAttribute('aria-hidden', 'false');

        selectedDestinationCoords = L.latLng(site.coordinates[0], site.coordinates[1]);
        updateRouteStatus('Destino seleccionado. Calcula la ruta o busca tu ubicación.', 'info');
        if (routingControl) map.removeControl(routingControl);

        highlightMarker(site.id);
        updateActiveSearchResult(site.id);
    }

    function highlightMarker(siteId) {
        unhighlightActiveMarker();
        if (markers[siteId]) {
            activeMarker = markers[siteId];
            activeMarker.setIcon(L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            }));
        }
    }

    function unhighlightActiveMarker() {
        if (activeMarker) {
            activeMarker.setIcon(new L.Icon.Default());
            activeMarker = null;
        }
    }

    function handleSearchInput() {
        const searchTerm = quitarTildes(searchInput.value.toLowerCase().trim());
        const filteredSites = searchTerm === "" ? sitesData : sitesData.filter(site => 
            quitarTildes((site.name || '').toLowerCase()).includes(searchTerm) || 
            quitarTildes((site.type || '').toLowerCase()).includes(searchTerm)
        );
        renderSearchResults(filteredSites);
    }

    function renderSearchResults(results) {
        searchResultsEl.innerHTML = '';
        if (results.length === 0) {
            searchResultsEl.innerHTML = '<p class="no-results">No se encontraron resultados.</p>';
            return;
        }
        
        const sitesByCategory = results.reduce((acc, site) => {
            const category = site.type || 'Otros';
            if (!acc[category]) acc[category] = [];
            acc[category].push(site);
            return acc;
        }, {});

        const sortedCategories = Object.keys(sitesByCategory).sort();

        sortedCategories.forEach(category => {
            const details = document.createElement('details');
            details.className = 'category-group';
            details.open = true;

            const summary = document.createElement('summary');
            summary.textContent = category;
            
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'category-content';

            const ul = document.createElement('ul');
            sitesByCategory[category].forEach(site => {
                const li = document.createElement('li');
                li.textContent = site.name;
                li.dataset.siteId = site.id;
                li.setAttribute('role', 'button');
                li.tabIndex = 0;
                li.addEventListener('click', () => selectSiteFromSearch(site));
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') selectSiteFromSearch(site);
                });
                ul.appendChild(li);
            });
            
            contentWrapper.appendChild(ul);
            details.appendChild(summary);
            details.appendChild(contentWrapper);
            searchResultsEl.appendChild(details);
        });
    }

    function selectSiteFromSearch(site) {
        if (visibleSiteMarker) {
            map.removeLayer(visibleSiteMarker);
        }
        const newMarker = markers[site.id];
        if (newMarker) {
            newMarker.addTo(map);
            visibleSiteMarker = newMarker;
        }
        hideSearchPanel();
        map.setView(site.coordinates, Math.max(map.getZoom(), 17));
        displaySiteInfo(site);
    }

    function selectSiteFromMarker(site) {
        hideSearchPanel();
        displaySiteInfo(site);
    }

    function updateActiveSearchResult(activeSiteId) {
        document.querySelectorAll('#search-results li').forEach(li => {
            li.classList.toggle('active', li.dataset.siteId === activeSiteId);
        });
    }

    function handleReviewSubmit(event) {
        event.preventDefault();
        const siteId = currentSiteIdInput.value;
        const reviewerName = document.getElementById('reviewer-name').value.trim();
        const reviewRatingInput = document.getElementById('review-rating');
        const reviewRating = parseInt(reviewRatingInput.value);
        const reviewComment = document.getElementById('review-comment').value.trim();

        if (!siteId || !reviewerName || !reviewRatingInput.value || !reviewComment) {
            alert('Por favor, completa todos los campos de la reseña.');
            return;
        }
        const newReview = { name: reviewerName, rating: reviewRating, comment: reviewComment, timestamp: new Date().toISOString() };
        if (!allReviews[siteId]) allReviews[siteId] = [];
        allReviews[siteId].unshift(newReview);
        saveReviews();
        displayReviews(siteId);
        reviewForm.reset();
        reviewRatingInput.value = "";
    }

    function displayReviews(siteId) {
        reviewsListEl.innerHTML = '';
        const siteReviews = allReviews[siteId] || [];
        if (siteReviews.length === 0) {
            reviewsListEl.innerHTML = '<p class="no-reviews-message">Aún no hay reseñas. ¡Sé el primero!</p>';
            return;
        }
        siteReviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            const ratingStars = '<span class="review-stars">' + '★'.repeat(review.rating) + '</span>' + '☆'.repeat(5 - review.rating);
            reviewItem.innerHTML = `<p><strong>${escapeHTML(review.name)}</strong> - ${ratingStars}</p><p>${escapeHTML(review.comment)}</p><small>${new Date(review.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</small>`;
            reviewsListEl.appendChild(reviewItem);
        });
    }

    function requestUserLocationOnce() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const err = new Error("La geolocalización no es soportada por este navegador.");
                handleLocationError({ code: -1, message: err.message });
                return reject(err);
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    updateUserPositionOnMap(position);
                    resolve(position);
                },
                (error) => {
                    handleLocationError(error);
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    function startWatchingUserLocation() {
        if (locationWatchId) {
            navigator.geolocation.clearWatch(locationWatchId);
            locationWatchId = null;
            updateRouteStatus('Seguimiento de ubicación detenido.', 'info');
            if (myLocationMarker) myLocationMarker.setPopupContent("Seguimiento detenido.");
            return;
        }
        if (!navigator.geolocation) {
            return handleLocationError({ code: -1, message: "La geolocalización no es soportada." });
        }
        updateRouteStatus('Iniciando seguimiento de ubicación...', 'loading');
        locationWatchId = navigator.geolocation.watchPosition(updateUserPositionOnMap, handleLocationError, {
            enableHighAccuracy: true, timeout: 10000, maximumAge: 0
        });
    }
    
    function updateUserPositionOnMap(position) {
    const { latitude: lat, longitude: lon, accuracy: acc } = position.coords;
    userCurrentCoords = L.latLng(lat, lon);

    if (!myLocationMarker) {
        myLocationMarker = L.marker(userCurrentCoords, {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })
        }).addTo(map);

        myLocationAccuracyCircle = L.circle(userCurrentCoords, {
            radius: acc,
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            weight: 2
        }).addTo(map);

        map.setView(userCurrentCoords, 16);
    } else {
        myLocationMarker.setLatLng(userCurrentCoords);
        myLocationAccuracyCircle.setLatLng(userCurrentCoords).setRadius(acc);
    }

    myLocationMarker.setPopupContent(`<b>¡Estás aquí!</b><br>Precisión: ${acc.toFixed(0)} metros.`);
    updateRouteStatus('Ubicación actualizada.', 'success');

    // 🚨 Chequear instrucciones cercanas
    verificarInstruccionesCercanas();
}
function verificarInstruccionesCercanas() {
    if (!userCurrentCoords || !routeInstructions || routeInstructions.length === 0) return;

    for (let i = 0; i < routeInstructions.length; i++) {
        const instr = routeInstructions[i];
        if (instr.spoken) continue;
        if (!instr.lat || !instr.lng) continue;

        const punto = L.latLng(instr.lat, instr.lng);
        const distancia = userCurrentCoords.distanceTo(punto); // en metros

        if (distancia <= 25) { // 📍 Puedes ajustar este umbral (ej: 30, 50m)
            instr.spoken = true;
            const textoTraducido = traducirInstruccion(instr.text);
            console.log("📢 Hablando instrucción cercana:", textoTraducido);
            speakInstruction(textoTraducido);
            break; // evitar que hable muchas al mismo tiempo
        }
    }
}


    function handleLocationError(error) {
        let userFriendlyMessage = "Error al obtener la ubicación: ";
        switch(error.code) {
            case error.PERMISSION_DENIED: userFriendlyMessage += "Permiso denegado."; break;
            case error.POSITION_UNAVAILABLE: userFriendlyMessage += "Información de ubicación no disponible."; break;
            case error.TIMEOUT: userFriendlyMessage += "La solicitud de ubicación ha caducado."; break;
            case -1: userFriendlyMessage = error.message; break;
            default: userFriendlyMessage += "Un error desconocido ha ocurrido."; break;
        }
        alert(userFriendlyMessage); 
        console.error("Error de Geolocalización:", error.message || error);
        updateRouteStatus(userFriendlyMessage, 'error');
        if (locationWatchId) {
            navigator.geolocation.clearWatch(locationWatchId);
            locationWatchId = null;
        }
    }

    async function mostrarRuta(profile) {
        hideInfoPanel();
        hideSearchPanel();
        updateRouteStatus('Calculando ruta...', 'loading');

        try {
            // Si no tenemos la ubicación, la pedimos y esperamos el resultado.
            if (!userCurrentCoords) {
                updateRouteStatus('Necesitamos tu ubicación para la ruta...', 'loading');
                await requestUserLocationOnce(); 
            }

            // El resto del código se ejecuta solo después de tener la ubicación.
            if (!selectedDestinationCoords) {
                updateRouteStatus('Por favor, selecciona un destino del mapa o la lista.', 'error');
                return;
            }

            if (routingControl) map.removeControl(routingControl);
            
            // Mostrar el marcador del destino
            const destinationSiteId = currentSiteIdInput.value;
            if (destinationSiteId && markers[destinationSiteId]) {
                if(visibleSiteMarker) map.removeLayer(visibleSiteMarker);
                visibleSiteMarker = markers[destinationSiteId].addTo(map);
            }

            routingControl = L.Routing.control({
                waypoints: [userCurrentCoords, selectedDestinationCoords],
                routeWhileDragging: false, show: false, collapsible: false,
                speech: false, 
                language: 'es',
router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1'
}),

                lineOptions: { styles: [{ color: '#0ea5e9', opacity: 0.9, weight: 7 }] },
                createMarker: () => null
            }).addTo(map);

            routingControl.on('routesfound', function (e) {
    const summary = e.routes[0].summary;
    const distanciaKm = (summary.totalDistance / 1000).toFixed(1);
    const tiempoMin = Math.round(summary.totalTime / 60);
    updateRouteStatus(`Ruta: ${distanciaKm} km, aprox. ${tiempoMin} min.`, 'success');

    // Guardar instrucciones
    const leg = e.routes[0].instructions;
    if (leg && leg.length > 0) {
        routeInstructions = leg.map(instr => ({
            ...instr,
            spoken: false
        }));

        // 🟢 Decir la primera instrucción de inmediato
        const primera = routeInstructions[0];
        primera.spoken = true;
        const textoTraducido = traducirInstruccion(primera.text);
        console.log("🗣️ Instrucción inicial:", textoTraducido);
        speakInstruction(textoTraducido);
    }
});


            routingControl.on('routingerror', function(e) {
                console.error("Error de enrutamiento:", e.error);
                updateRouteStatus(`Error: ${e.error.message || 'Ruta no encontrada'}`, 'error');
            });

        } catch (error) {
            // Esto se ejecuta si el usuario niega el permiso de ubicación.
            console.error("No se pudo calcular la ruta por un error de ubicación:", error);
            updateRouteStatus('No se puede calcular la ruta sin tu ubicación.', 'error');
        }
    }

    function updateRouteStatus(message, type = 'info') {
        if (!estadoRutaEl) return;
        estadoRutaEl.textContent = message;
        estadoRutaEl.className = 'route-status';
        if (type !== 'clear') estadoRutaEl.classList.add(type);
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]));
    }

    function quitarTildes(texto) {
        if (!texto) return "";
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Llama a la función de inicialización del script
    init();
});