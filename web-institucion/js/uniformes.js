document.addEventListener('DOMContentLoaded', () => {
    fetch('content/uniformes.md?t=' + Date.now())
        .then(res => res.text())
        .then(texto => {
            const partes = texto.split('---');
            const datos = parsearYAML(partes[1]);

            // TÍTULO DE UNIFORMES
            const titulo = document.getElementById('tituloUniformes');
            if (titulo && datos.titulo) {
                titulo.textContent = datos.titulo;
            }

            // GALERÍA DE UNIFORMES
            const galeria = document.getElementById('galeriaUniformes');
            if (galeria && datos.uniformes) {
                galeria.innerHTML = '';
                datos.uniformes.forEach(uniforme => {
                    galeria.innerHTML += `
                        <div class="item">
                            <img src="${uniforme.imagen}?t=${Date.now()}" alt="${uniforme.nombre}">
                            <p>${uniforme.nombre}</p>
                        </div>
                    `;
                });
            }

            // HORARIOS
            const tituloHorarios = document.getElementById('tituloHorarios');
            if (tituloHorarios && datos.horarios_titulo) {
                tituloHorarios.textContent = datos.horarios_titulo;
            }

            const ingreso = document.getElementById('horarioIngreso');
            if (ingreso) {
                ingreso.innerHTML = `
                    <h3>🕖 ${datos.hora_ingreso_titulo || 'Ingreso'}</h3>
                    <p><strong>Horario único:</strong> ${datos.hora_ingreso || ''}</p>
                `;
            }

            const salida = document.getElementById('horarioSalida');
            if (salida) {
                salida.innerHTML = `
                    <h3>🕐 ${datos.hora_salida_titulo || 'Salida'}</h3>
                    <p><strong>Horario único:</strong> ${datos.hora_salida || ''}</p>
                `;
            }

            // NOTA ADICIONAL
            const nota = document.getElementById('notaUniformes');
            if (nota) {
                if (datos.nota_adicional) {
                    nota.textContent = datos.nota_adicional;
                    nota.style.display = 'block';
                } else {
                    nota.style.display = 'none';
                }
            }
        })
        .catch(err => {
            console.error('Error al cargar uniformes:', err);
        });
});

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
                if (k && v.length) itemActual[k.trim()] = v.join(':').trim();
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
                // Quitar comillas si las tiene
                resultado[clave] = valor.replace(/^["']|["']$/g, '');
                listaActual = null;
            }
        }
    });

    return resultado;
}