// =============================================
// buscar.js — búsqueda por nombre o número
// =============================================

// La PokeAPI no busca por coincidencias parciales, así que
// pedimos la lista de nombres una vez y filtramos nosotros.
const MAXIMO_RESULTADOS = 48;

const parametros = new URLSearchParams(window.location.search);
const texto = (parametros.get('q') || '').trim().toLowerCase();

const input = document.getElementById('q');
const resumen = document.getElementById('resumen');
const resultados = document.getElementById('resultados');

input.value = texto;

async function buscar() {
  if (!texto) return; // aún no se ha buscado nada

  resumen.textContent = 'Buscando…';
  try {
    const datos = await obtenerPokemones(0, 2000);

    // filter: nos quedamos con los que contienen el texto o tienen ese número
    const encontrados = datos.results
      .map((pokemon) => ({ id: idDesdeUrl(pokemon.url), nombre: pokemon.name }))
      .filter((pokemon) => pokemon.nombre.includes(texto) || String(pokemon.id) === texto);

    if (encontrados.length === 0) {
      resumen.textContent = '';
      Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: `No hay ningún pokémon que coincida con "${texto}". Prueba con menos letras.`,
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    const visibles = encontrados.slice(0, MAXIMO_RESULTADOS);
    resumen.textContent =
      encontrados.length > MAXIMO_RESULTADOS
        ? `${encontrados.length} resultados para "${texto}" (mostrando ${MAXIMO_RESULTADOS})`
        : `${encontrados.length} resultado(s) para "${texto}"`;

    resultados.innerHTML = visibles.map((p) => tarjetaPokemon(p.id, p.nombre)).join('');
    resultados.classList.add('animate__animated', 'animate__fadeIn');
  } catch (error) {
    resumen.textContent = '';
    mostrarError(error.message);
  }
}

buscar();
