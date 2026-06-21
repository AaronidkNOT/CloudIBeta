# Cloud¡

**Landing page comercial para un servicio de hosting y desarrollo web económico**, pensado para emprendedores y pequeños negocios que quieren tener presencia online sin pagar de más.

> Proyecto personal de práctica — Frontend 100% en HTML, CSS y JavaScript puro (sin frameworks ni build tools), pensado para correr en hosting compartido tradicional.

---

## Demo

```
index.html              → Landing principal (planes, características, hero)
cliente.html             → Casos de éxito / portfolio de clientes
quienes-somos.html       → Equipo, misión e historia
contacto.html            → Formulario de contacto (Email/WhatsApp)
mapa.html                → Mapa turístico de Carhué (próximamente)
aviso-legal.html
terminos-condiciones.html
politica-privacidad.html
```

Para verlo localmente, simplemente abrí `index.html` en el navegador, o levantá un servidor estático:

```bash
# Con Python
python3 -m http.server 8080

# Con Node (npx)
npx serve .
```

---

## Características principales

- **Diseño responsive**, mobile-first, con menú hamburguesa animado.
- **Modo oscuro por defecto**, con interruptor de tema (persistido en `localStorage`).
- **Animaciones al hacer scroll** usando `IntersectionObserver` (sin librerías externas).
- **Fondo animado de partículas** interactivo con [particles.js](https://github.com/VincentGarreau/particles.js).
- **Acordeones sin JavaScript** ("Más información") usando el truco de `<input type="checkbox">` + CSS.
- **Formulario de contacto** funcional vía [FormSubmit](https://formsubmit.co/), con honeypot anti-spam.
- **SEO básico**: meta description, `canonical`, `robots.txt`.
- **Content-Security-Policy** configurada en cada página.
- **URLs limpias** (sin `.html`) gracias a reglas de `mod_rewrite` en `.htaccess`.
- Paleta de colores y componentes (botones, tarjetas, header, footer) centralizados en `style.css` mediante variables CSS, para que **todas las páginas se vean exactamente iguales**.

---

## Tecnologías usadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de las páginas |
| **CSS3** (variables, flexbox, grid) | Estilos propios (`style.css`, `stylemapa.css`) |
| **Tailwind CSS** (compilado, `dist/styles.css`) | Utilidades de layout y espaciado |
| **JavaScript (Vanilla)** | Menú móvil, scroll animations, tema claro/oscuro, contador de caracteres |
| **particles.js** | Fondo animado interactivo |
| **Google Fonts (Poppins)** | Tipografía |
| **FormSubmit** | Backend del formulario de contacto sin servidor propio |
| **Apache `.htaccess`** | Reescritura de URLs, hosting compartido |

No usa frameworks (React, Vue, etc.) ni bundlers (Webpack, Vite) a propósito: el objetivo fue que el sitio funcione en **cualquier hosting compartido básico**, sin proceso de build.

---

## Estructura del proyecto

```
Proyecto Cloud/
├── index.html                  # Landing principal
├── cliente.html                # Casos de éxito / clientes
├── quienes-somos.html          # Sobre el equipo
├── contacto.html                # Formulario de contacto
├── mapa.html                   # Sub-proyecto: mapa turístico (WIP)
├── aviso-legal.html
├── terminos-condiciones.html
├── politica-privacidad.html
├── style.css                   # Estilos propios + variables de color
├── stylemapa.css               # Estilos del mapa turístico
├── script.js                   # Lógica global (menú, tema, animaciones)
├── particle.js                 # Configuración de particles.js
├── scriptmapa.js
├── dist/
│   └── styles.css              # Tailwind compilado
├── imagenes/
├── robots.txt
└── .htaccess                   # Rewrite rules (URLs limpias)
```

---

## Sistema de diseño

Todos los colores, tipografías y componentes reutilizables (botones, tarjetas, header, footer) viven como **variables CSS y clases semánticas en español** dentro de `style.css`:

```css
:root {
    --fondo-primario: #0f172a;
    --texto-enlace: #38bdf8;
    --cielo-500: #0ea5e9;
    /* ... */
}
```

Esto permite que **cualquier página nueva** (como `cliente.html`) reutilice exactamente la misma paleta y el mismo logo (`.logo-con-tema`) sin tener que redefinir estilos.

---

## Estado del proyecto

Proyecto desarrollado originalmente en 2024 y reorganizado/documentado para portfolio.

---

## Autor

Desarrollado por **Aaron Dominguez**.

---

## Licencia

Este proyecto es de uso libre, Cualquier duda que tengas contactame.
