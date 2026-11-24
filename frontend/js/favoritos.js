// =============================================
// favoritos.js — CRUD de favoritos con JSON Server
// (READ, UPDATE y DELETE; el CREATE está en detalle.js)
// =============================================

const contenedor = document.getElementById('favoritos');
const resumen = document.getElementById('resumen');

let favoritos = []; // última lista que llegó del backend

// READ
async function cargarFavoritos() {
  try {
    favoritos = await obtenerFavoritos();

    if (favoritos.length === 0) {
      resumen.textContent = '';
      contenedor.innerHTML = `
        <li class="col-span-full rounded-lg bg-white p-8 text-center ring-1 ring-stone-200">
          <p class="font-semibold">Aún no tienes favoritos</p>
          <p class="mt-1 text-stone-600">Abre cualquier pokémon y pulsa «Agregar a favoritos».</p>
          <a href="index.html" class="mt-4 inline-block rounded-md bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">Ver el listado</a>
        </li>`;
      return;
    }

    resumen.textContent = `${favoritos.length} guardado(s) en JSON Server`;
    contenedor.innerHTML = favoritos.map(tarjetaFavorito).join('');
  } catch (error) {
    resumen.textContent = '';
    mostrarError('No se pudo conectar con JSON Server. ¿Ejecutaste "npm start"?');
  }
}

function tarjetaFavorito(favorito) {
  return `
    <li class="flex items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-stone-200">
      <a href="detalle.html?id=${favorito.pokemonId}" class="shrink-0">
        <img src="${favorito.imagen}" alt="${favorito.nombre}" class="size-20 object-contain">
      </a>
      <div class="min-w-0 flex-1">
        <p class="num text-xs text-stone-500">${formatearNumero(favorito.pokemonId)}</p>
        <a href="detalle.html?id=${favorito.pokemonId}" class="font-semibold capitalize hover:underline">${favorito.nombre}</a>
        <p class="truncate text-sm text-stone-600">${favorito.apodo ? `“${favorito.apodo}”` : 'Sin apodo'}</p>
        <div class="mt-2 flex gap-3 text-sm font-medium">
          <button onclick="editarApodo('${favorito.id}')" class="text-stone-700 hover:text-stone-900 hover:underline">Editar apodo</button>
          <button onclick="borrarFavorito('${favorito.id}')" class="text-red-700 hover:underline">Eliminar</button>
        </div>
      </div>
    </li>`;
}

// UPDATE
async function editarApodo(id) {
  const favorito = favoritos.find((f) => f.id === id);
  const { isConfirmed, value } = await Swal.fire({
    title: 'Editar apodo',
    input: 'text',
    inputValue: favorito.apodo || '',
    inputPlaceholder: 'Escribe el nuevo apodo',
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
  });
  if (!isConfirmed) return;

  try {
    await actualizarFavorito(id, { apodo: value.trim() });
    Swal.fire({ icon: 'success', title: 'Apodo actualizado', timer: 1500, showConfirmButton: false });
    cargarFavoritos();
  } catch (error) {
    mostrarError(error.message);
  }
}

// DELETE
async function borrarFavorito(id) {
  const favorito = favoritos.find((f) => f.id === id);
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: `¿Eliminar a ${favorito.nombre}?`,
    text: 'Se borrará de tus favoritos.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
  });
  if (!isConfirmed) return;

  try {
    await eliminarFavorito(id);
    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    cargarFavoritos();
  } catch (error) {
    mostrarError(error.message);
  }
}

cargarFavoritos();
