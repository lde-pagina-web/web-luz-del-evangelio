document.addEventListener('DOMContentLoaded', () => {
    fetch('content/menu.md?t=' + Date.now())
        .then(res => res.text())
        .then(texto => {
            const partes = texto.split('---');
            const datos = parsearYAML(partes[1]);

            document.getElementById('tituloMenu').textContent = 
                datos.titulo || 'Menú del Bar';
            document.getElementById('semanaMenu').textContent = 
                datos.semana || '';

            const contenedor = document.getElementById('contenedorImagenMenu');

            if (datos.imagen) {
                contenedor.innerHTML = `
                    <img src="${datos.imagen}?t=${Date.now()}" 
                         alt="Menú del bar" 
                         class="imagen-grande"
                         onclick="abrirImagen(this.src)">
                    <p class="hint">👆 Clic en la imagen para verla en tamaño completo</p>
                `;
            } else {
                contenedor.innerHTML = '<p>No hay menú publicado esta semana.</p>';
            }
        })
        .catch(err => {
            console.error('Error al cargar menú:', err);
            document.getElementById('contenedorImagenMenu').innerHTML = 
                '<p>No se pudo cargar el menú.</p>';
        });
});

function abrirImagen(src) {
    window.open(src, '_blank');
}

function parsearYAML(texto) {
    const lineas = texto.split('\n');
    const resultado = {};
    let listaActual = null;
    let itemActual = null;

    lineas.forEach(linea => {
        if (!linea.trim()) return;
        const indentacion = linea.match(/^\s*/)[0].length;
        const contenido = linea.trim();

        if (contenido.startsWith('- ')) {
            if (listaActual) {
                itemActual = {};
                resultado[listaActual].push(itemActual);
                const [k, ...v] = contenido.substring(2).split(':');
                itemActual[k.trim()] = v.join(':').trim();
            }
        } else if (indentacion > 0 && itemActual && contenido.includes(':')) {
            const [k, ...v] = contenido.split(':');
            itemActual[k.trim()] = v.join(':').trim();
        } else if (contenido.includes(':')) {
            const [k, ...v] = contenido.split(':');
            const clave = k.trim();
            const valor = v.join(':').trim();
            if (valor === '') {
                resultado[clave] = [];
                listaActual = clave;
                itemActual = null;
            } else {
                resultado[clave] = valor;
                listaActual = null;
            }
        }
    });

    return resultado;
}