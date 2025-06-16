src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js">
particlesJS("particles-js", {
    "particles": {
    "number": {
        "value": 80,
        "density": {
        "enable": true,
        "value_area": 800
        }
    },
    "color": { "value": "#ffffff" },
    "shape": {
        "type": "circle",
        "stroke": { "width": 0, "color": "#000000" },
        "polygon": { "nb_sides": 5 }
    },
    "opacity": {
        "value": 0.5,
        "random": false,
        "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false }
    },
    "size": {
        "value": 3,
        "random": true,
        "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false }
    },
    "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
    },
    "move": {
        "enable": true,
        "speed": 3,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
    }
    },
    "interactivity": {
    "detect_on": "window",
    "events": {
        "onhover": { "enable": true, "mode": "grab" },
        "onclick": { "enable": true, "mode": "repulse" },
        "resize": true
    },
    "modes": {
        "grab": {
        "distance": 150,
        "line_linked": { "opacity": 1 }
        },
        "bubble": {
        "distance": 250,
        "size": 0,
        "duration": 2,
        "opacity": 0,
        "speed": 3
        },
        "repulse": {
        "distance": 150
        },
        "push": {
        "particles_nb": 1
        },
        "remove": {
        "particles_nb": 2
        }
    }
    },
    "retina_detect": true
});