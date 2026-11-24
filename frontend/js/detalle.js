// =============================================
// detalle.js — ficha de un pokémon + agregar/quitar favorito
// =============================================

// Leemos el id de la URL: detalle.html?id=25
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get('id');

const detalle = document.getElementById('detalle');

// Nombres de las estadísticas en español
const NOMBRES_STATS = {
  hp: 'Vida',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidad',
};

let pokemon = null; // datos que llegan de la PokeAPI
let favorito = null; // registro en JSON Server (null si no es favorito)

async function cargarDetalle() {
  if (!id) {
    detalle.innerHTML = '<p class="text-stone-600">Falta el pokémon en la URL.</p>';
    return;
  }

  try {
    pokemon = await obtenerPokemon(id);
    pintarDetalle();
  } catch (error) {
    detalle.innerHTML = '<p class="text-stone-600">No encontramos ese pokémon.</p>';
    mostrarError(error.message);
    return;
  }

  // Si el backend está apagado, la ficha se ve igual pero avisamos
  try {
    favorito = await buscarFavorito(pokemon.id);
    pintarBoton();
  } catch (error) {
    mostrarError('No se pudo conectar con JSON Server. ¿Ejecutaste "npm start"?');
  }
}

function pintarDetalle() {
  const tipos = pokemon.types
    .map((t) => `<span class="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium capitalize ring-1 ring-stone-200">${t.type.name}</span>`)
    .join('');

  const stats = pokemon.stats
    .map((s) => {
      const porcentaje = Math.min(100, Math.round((s.base_stat / 200) * 100));
      return `
        <div class="grid grid-cols-[7rem_2.5rem_1fr] items-center gap-3 text-sm">
          <span class="text-stone-600">${NOMBRES_STATS[s.stat.name] || s.stat.name}</span>
          <span class="num text-right font-semibold">${s.base_stat}</span>
          <div class="h-2 rounded-full bg-stone-200">
            <div class="h-2 rounded-full bg-red-600" style="width: ${porcentaje}%"></div>
          </div>
        </div>`;
    })
    .join('');

  detalle.innerHTML = `
    <div class="animate__animated animate__fadeInUp grid gap-8 rounded-lg bg-white p-6 ring-1 ring-stone-200 md:grid-cols-2">
      <img src="${imagenPokemon(pokemon.id)}" alt="${pokemon.name}" class="mx-auto w-full max-w-sm">
      <div>
        <p class="num text-stone-500">${formatearNumero(pokemon.id)}</p>
        <h1 class="text-4xl font-bold capitalize tracking-tight">${pokemon.name}</h1>
        <div class="mt-3 flex flex-wrap gap-2">${tipos}</div>

        <dl class="num mt-6 grid grid-cols-2 gap-4">
          <div><dt class="text-sm text-stone-600">Altura</dt><dd class="text-lg font-semibold">${pokemon.height / 10} m</dd></div>
          <div><dt class="text-sm text-stone-600">Peso</dt><dd class="text-lg font-semibold">${pokemon.weight / 10} kg</dd></div>
        </dl>

        <h2 class="mt-6 font-semibold">Estadísticas base</h2>
        <div class="mt-3 space-y-2">${stats}</div>

        <button id="botonFavorito" disabled
                class="mt-8 rounded-md px-5 py-2 font-semibold disabled:opacity-50">Cargando…</button>
      </div>
    </div>`;

  document.title = `${pokemon.name} · Pokédex`;
  document.getElementById('botonFavorito').addEventListener('click', alternarFavorito);
}

function pintarBoton() {
  const boton = document.getElementById('botonFavorito');
  boton.disabled = false;
  if (favorito) {
    boton.textContent = 'Quitar de favoritos';
    boton.className = 'mt-8 rounded-md bg-white px-5 py-2 font-semibold text-red-700 ring-1 ring-red-300 hover:bg-red-50';
  } else {
    boton.textContent = 'Agregar a favoritos';
    boton.className = 'mt-8 rounded-md bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700';
  }
}

async function alternarFavorito() {
  try {
    if (favorito) {
      // DELETE
      await eliminarFavorito(favorito.id);
      favorito = null;
      Swal.fire({ icon: 'success', title: 'Quitado de favoritos', timer: 1500, showConfirmButton: false });
    } else {
      // CREATE: pedimos un apodo opcional
      const { isConfirmed, value } = await Swal.fire({
        title: `Agregar a ${pokemon.name}`,
        input: 'text',
        inputLabel: 'Apodo (opcional)',
        inputPlaceholder: 'Ej: Chispita',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
      });
      if (!isConfirmed) return;

      favorito = await crearFavorito({
        pokemonId: pokemon.id,
        nombre: pokemon.name,
        imagen: imagenPokemon(pokemon.id),
        apodo: value.trim(),
      });
      Swal.fire({ icon: 'success', title: '¡Guardado en favoritos!', timer: 1500, showConfirmButton: false });
    }
    pintarBoton();
  } catch (error) {
    mostrarError(error.message);
  }
}

cargarDetalle();
