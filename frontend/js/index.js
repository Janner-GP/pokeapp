// =============================================
// index.js — listado paginado de pokémon
// =============================================

const POR_PAGINA = 24;

// 1. Leemos la página de la URL: index.html?pagina=3
const parametros = new URLSearchParams(window.location.search);
const pagina = Number(parametros.get('pagina')) || 1;

const lista = document.getElementById('lista');
const resumen = document.getElementById('resumen');
const anterior = document.getElementById('anterior');
const siguiente = document.getElementById('siguiente');
const paginaActual = document.getElementById('paginaActual');

async function cargarListado() {
  try {
    const offset = (pagina - 1) * POR_PAGINA;
    const datos = await obtenerPokemones(offset, POR_PAGINA);
    const totalPaginas = Math.ceil(datos.count / POR_PAGINA);

    // 2. Pintamos las tarjetas
    let html = '';
    for (const pokemon of datos.results) {
      html += tarjetaPokemon(idDesdeUrl(pokemon.url), pokemon.name);
    }
    lista.innerHTML = html;
    lista.classList.add('animate__animated', 'animate__fadeIn');

    resumen.textContent = `${datos.count} pokémon en total`;
    paginaActual.textContent = `Página ${pagina} de ${totalPaginas}`;

    // 3. Enlaces de paginación (se ocultan si no hay a dónde ir)
    if (pagina > 1) anterior.href = `index.html?pagina=${pagina - 1}`;
    else anterior.classList.add('invisible');

    if (pagina < totalPaginas) siguiente.href = `index.html?pagina=${pagina + 1}`;
    else siguiente.classList.add('invisible');
  } catch (error) {
    resumen.textContent = '';
    mostrarError(error.message);
  }
}

cargarListado();
