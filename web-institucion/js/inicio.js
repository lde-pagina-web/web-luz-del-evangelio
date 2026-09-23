document.addEventListener('DOMContentLoaded', () => {
    fetch('content/inicio.md?t=' + Date.now())
        .then(res => res.text())
        .then(texto => {
            const partes = texto.split('---');
            const datos = parsearYAML(partes[1]);

            // CARRUSEL
            const slides = document.getElementById('carruselSlides');
            const puntos = document.getElementById('carruselPuntos');
            if (slides && datos.carrusel) {
                slides.innerHTML = '';
                puntos.innerHTML = '';
                datos.carrusel.forEach((item, i) => {
                    slides.innerHTML += `
                        <div class="carrusel-slide" style="background-image: url('${item.imagen}');">
                            <div class="carrusel-titulo">${item.titulo || ''}</div>
                        </div>
                    `;
                    const punto = document.createElement('div');
                    punto.className = 'carrusel-punto' + (i === 0 ? ' activo' : '');
                    punto.onclick = () => irASlide(i);
                    puntos.appendChild(punto);
                });

                window.slides = document.querySelectorAll('.carrusel-slide');
                window.totalSlides = window.slides.length;
                window.slideActual = 0;
                if (window.totalSlides > 0) {
                    setInterval(() => {
                        window.slideActual = (window.slideActual + 1) % window.totalSlides;
                        actualizarCarrusel();
                    }, 5000);
                }
            }

            // HISTORIA
            const historia = document.getElementById('historia');
            if (historia && datos.historia) {
                historia.innerHTML = datos.historia.replace(/\n/g, '<br>');
            }
            const historiaTitulo = document.getElementById('historiaTitulo');
            if (historiaTitulo && datos.historia_titulo) {
                historiaTitulo.textContent = datos.historia_titulo;
            }

            // OBJETIVO
            const objetivo = document.getElementById('objetivo');
            if (objetivo && datos.objetivo) {
                objetivo.innerHTML = datos.objetivo.replace(/\n/g, '<br>');
            }
            const objetivoTitulo = document.getElementById('objetivoTitulo');
            if (objetivoTitulo && datos.objetivo_titulo) {
                objetivoTitulo.textContent = datos.objetivo_titulo;
            }

            // VIDEO
            const videoContenedor = document.getElementById('videoContenedor');
            const videoTitulo = document.getElementById('videoTitulo');
            if (videoContenedor && datos.video) {
                videoContenedor.innerHTML = `
                    <video controls preload="metadata" class="video-institucional">
                        <source src="${datos.video}" type="video/mp4">
                        Tu navegador no soporta video HTML5.
                    </video>
                `;
            } else if (videoContenedor) {
                videoContenedor.parentElement.style.display = 'none';
            }
            if (videoTitulo && datos.video_titulo) {
                videoTitulo.textContent = datos.video_titulo;
            }

            // NOTICIAS
            const noticiasGrid = document.getElementById('noticiasGrid');
            if (noticiasGrid && datos.noticias) {
                noticiasGrid.innerHTML = '';
                datos.noticias.forEach((noticia, i) => {
                    noticiasGrid.innerHTML += `
                        <div class="noticia-card" onclick="abrirNoticia(${i})">
                            <img src="${noticia.imagen}" alt="${noticia.titulo}">
                            <div class="noticia-contenido">
                                <span class="fecha">${noticia.fecha}</span>
                                <h3>${noticia.titulo}</h3>
                                <p>${noticia.descripcion}</p>
                                <span class="leer-mas">Leer más →</span>
                            </div>
                        </div>
                    `;
                });
                window.noticiasData = datos.noticias;
            }
        })
        .catch(err => {
            console.error('Error al cargar inicio:', err);
        });
});

function moverCarrusel(dir) {
    if (!window.slides || window.totalSlides === 0) return;
    window.slideActual = (window.slideActual + dir + window.totalSlides) % window.totalSlides;
    actualizarCarrusel();
}

function irASlide(i) {
    window.slideActual = i;
    actualizarCarrusel();
}

function actualizarCarrusel() {
    const slidesEl = document.getElementById('carruselSlides');
    if (slidesEl) {
        slidesEl.style.transform = `translateX(-${window.slideActual * 100}%)`;
    }
    document.querySelectorAll('.carrusel-punto').forEach((p, i) => {
        p.classList.toggle('activo', i === window.slideActual);
    });
}

/* ===== MODAL DE NOTICIAS ===== */
function abrirNoticia(indice) {
    const noticia = window.noticiasData[indice];
    if (!noticia) return;

    const modal = document.getElementById('modalNoticia');
    document.getElementById('modalImg').src = noticia.imagen;
    document.getElementById('modalTitulo').textContent = noticia.titulo;
    document.getElementById('modalFecha').textContent = noticia.fecha;
    document.getElementById('modalDescripcion').textContent = noticia.descripcion;

    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarNoticia() {
    document.getElementById('modalNoticia').classList.remove('activo');
    document.body.style.overflow = '';
}

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarNoticia();
});

function parsearYAML(texto) {
    const lineas = texto.split('\n');
    const resultado = {};
    let listaActual = null;
    let itemActual = null;
    let enBloque = false;
    let bloqueClave = null;
    let bloqueTexto = [];

    lineas.forEach(linea => {
        if (enBloque) {
            if (linea.match(/^\s{2,}/) || linea.trim() === '') {
                bloqueTexto.push(linea.replace(/^  /, ''));
                return;
            } else {
                resultado[bloqueClave] = bloqueTexto.join('\n').trim();
                enBloque = false;
                bloqueTexto = [];
            }
        }

        if (!linea.trim()) return;
        const indentacion = linea.match(/^\s*/)[0].length;
        const contenido = linea.trim();

        if (contenido.startsWith('- ')) {
            if (listaActual) {
                itemActual = {};
                resultado[listaActual].push(itemActual);
                const [k, ...v] = contenido.substring(2).split(':');
                if (k && v.length) itemActual[k.trim()] = v.join(':').trim();
            }
        } else if (indentacion > 0 && itemActual && contenido.includes(':')) {
            const [k, ...v] = contenido.split(':');
            itemActual[k.trim()] = v.join(':').trim();
        } else if (contenido.includes(':')) {
            const [k, ...v] = contenido.split(':');
            const clave = k.trim();
            const valor = v.join(':').trim();
            
            if (valor === '|') {
                enBloque = true;
                bloqueClave = clave;
                bloqueTexto = [];
            } else if (valor === '') {
                resultado[clave] = [];
                listaActual = clave;
                itemActual = null;
            } else {
                resultado[clave] = valor;
                listaActual = null;
            }
        }
    });

    if (enBloque) {
        resultado[bloqueClave] = bloqueTexto.join('\n').trim();
    }

    return resultado;
}