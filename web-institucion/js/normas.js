document.addEventListener('DOMContentLoaded', () => {
    fetch('content/normas.md?t=' + Date.now())
        .then(res => res.text())
        .then(texto => {
            const partes = texto.split('---');
            const datos = parsearYAML(partes[1]);

            // Título
            const titulo = document.getElementById('tituloNormas');
            if (titulo && datos.titulo) {
                titulo.textContent = datos.titulo;
            }

            // Imagen
            const contenedor = document.getElementById('contenedorImagenNormas');
            if (contenedor && datos.imagen) {
                contenedor.innerHTML = `
                    <img src="${datos.imagen}?t=${Date.now()}" 
                         alt="Normas de la institución" 
                         class="imagen-grande"
                         onclick="abrirImagen(this.src)">
                    <p class="hint">👆 Clic en la imagen para verla en tamaño completo</p>
                `;
            } else if (contenedor) {
                contenedor.innerHTML = '<p>No hay normas publicadas por ahora.</p>';
            }

            // Texto adicional
            const textoAdicional = document.getElementById('textoAdicionalNormas');
            if (textoAdicional && datos.texto_adicional) {
                textoAdicional.innerHTML = datos.texto_adicional.replace(/\n/g, '<br>');
            } else if (textoAdicional) {
                textoAdicional.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error al cargar normas:', err);
        });
});

function abrirImagen(src) {
    window.open(src, '_blank');
}

function parsearYAML(texto) {
    const lineas = texto.split('\n');
    const resultado = {};
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
        const contenido = linea.trim();

        if (contenido.includes(':')) {
            const [k, ...v] = contenido.split(':');
            const clave = k.trim();
            const valor = v.join(':').trim();
            
            if (valor === '|') {
                enBloque = true;
                bloqueClave = clave;
                bloqueTexto = [];
            } else if (valor !== '') {
                resultado[clave] = valor;
            }
        }
    });

    if (enBloque) {
        resultado[bloqueClave] = bloqueTexto.join('\n').trim();
    }

    return resultado;
}