// =============================================
// api.js — funciones compartidas por todas las páginas
// =============================================

// API pública de Pokémon (solo lectura)
const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// Nuestro backend con JSON Server (guarda los favoritos)
const API_URL = 'http://localhost:3000';

// ---------- PokeAPI ----------

// Lista paginada: devuelve { count, results: [{ name, url }] }
async function obtenerPokemones(offset, limit) {
  const respuesta = await fetch(`${POKEAPI_URL}/pokemon?offset=${offset}&limit=${limit}`);
  if (!respuesta.ok) throw new Error('No se pudo cargar la lista de pokémon');
  return respuesta.json();
}

// Un pokémon por nombre o número
async function obtenerPokemon(nombreOId) {
  const respuesta = await fetch(`${POKEAPI_URL}/pokemon/${nombreOId}`);
  if (!respuesta.ok) throw new Error('Pokémon no encontrado');
  return respuesta.json();
}

// La url de la lista termina en /pokemon/25/ → sacamos el 25
function idDesdeUrl(url) {
  const partes = url.split('/').filter(Boolean);
  return Number(partes[partes.length - 1]);
}

function imagenPokemon(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// ---------- JSON Server (CRUD de favoritos) ----------

// READ: todos los favoritos
async function obtenerFavoritos() {
  const respuesta = await fetch(`${API_URL}/favoritos`);
  if (!respuesta.ok) throw new Error('No se pudo conectar con el backend');
  return respuesta.json();
}

// READ: buscar si un pokémon ya es favorito (devuelve el favorito o null)
async function buscarFavorito(pokemonId) {
  const respuesta = await fetch(`${API_URL}/favoritos?pokemonId=${pokemonId}`);
  if (!respuesta.ok) throw new Error('No se pudo conectar con el backend');
  const lista = await respuesta.json();
  return lista[0] || null;
}

// CREATE
async function crearFavorito(favorito) {
  const respuesta = await fetch(`${API_URL}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(favorito),
  });
  if (!respuesta.ok) throw new Error('No se pudo guardar el favorito');
  return respuesta.json();
}

// UPDATE (solo los campos que cambian)
async function actualizarFavorito(id, datos) {
  const respuesta = await fetch(`${API_URL}/favoritos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) throw new Error('No se pudo actualizar el favorito');
  return respuesta.json();
}

// DELETE
async function eliminarFavorito(id) {
  const respuesta = await fetch(`${API_URL}/favoritos/${id}`, { method: 'DELETE' });
  if (!respuesta.ok) throw new Error('No se pudo eliminar el favorito');
}

// ---------- Ayudas de interfaz ----------

// Número con ceros: 25 → #0025
function formatearNumero(id) {
  return '#' + String(id).padStart(4, '0');
}

// Tarjeta de un pokémon (se usa en el listado y en la búsqueda)
function tarjetaPokemon(id, nombre) {
  return `
    <li>
      <a href="detalle.html?id=${id}"
         class="group block rounded-lg bg-white p-3 ring-1 ring-stone-200 transition hover:ring-stone-400">
        <img src="${imagenPokemon(id)}" alt="${nombre}" loading="lazy"
             class="mx-auto aspect-square w-full max-w-40 object-contain transition group-hover:scale-105">
        <p class="num mt-2 text-xs text-stone-500">${formatearNumero(id)}</p>
        <p class="font-semibold capitalize text-stone-900">${nombre}</p>
      </a>
    </li>`;
}

// Muestra un error con SweetAlert2
function mostrarError(mensaje) {
  Swal.fire({ icon: 'error', title: 'Algo salió mal', text: mensaje, confirmButtonColor: '#dc2626' });
}
