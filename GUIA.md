# Guía: construir PokeApp desde cero

Orden recomendado: **primero el backend, luego una vista a la vez**, probando cada paso antes de seguir. Cada paso termina con algo que se puede ver funcionando.

El código completo de cada archivo está en esta misma carpeta por si te atascas; intenta escribirlo tú primero.

---

## Paso 0. Herramientas

1. Instala **Node.js** (versión LTS) desde [https://nodejs.org](https://nodejs.org). Comprueba en la terminal:

   ```bash
   node -v
   ```

   ```bash
   npm -v
   ```
2. Instala **VS Code** y, opcionalmente, la extensión **Live Server**.
3. Ten a mano la documentación de la PokeAPI: [https://pokeapi.co/docs/v2](https://pokeapi.co/docs/v2). Abre en el navegador [https://pokeapi.co/api/v2/pokemon/pikachu](https://pokeapi.co/api/v2/pokemon/pikachu) para ver qué devuelve.

## Paso 1. Crear el proyecto

```bash
mkdir PokeApp
```

```bash
cd PokeApp
```

```bash
npm init -y
```

Instala las dos herramientas de desarrollo:

```bash
npm install -D json-server@1.0.0-beta.15 serve
```

- `json-server`: crea una API REST a partir de un archivo JSON.
- `serve`: sirve los HTML en `http://localhost:5500` (si usas Live Server, no lo necesitas).

Crea un `.gitignore` con una línea: `node_modules/`.

## Paso 2. El backend con JSON Server

1. Crea `db.json` en la raíz de `PokeApp`. Cada clave es un recurso (una "tabla"):

   ```json
   {
     "favoritos": [
       {
         "id": "1",
         "pokemonId": 25,
         "nombre": "pikachu",
         "imagen": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
         "apodo": "Chispita"
       }
     ]
   }
   ```
2. En `package.json`, cambia `"scripts"` por:

   ```json
   "scripts": {
     "api": "json-server db.json --port 3000",
     "web": "serve frontend --listen 5500"
   }
   ```
3. Arranca la API:

   ```bash
   npm run api
   ```
4. **Prueba:** abre [http://localhost:3000/favoritos](http://localhost:3000/favoritos) en el navegador. Debes ver a Pikachu. Prueba también `http://localhost:3000/favoritos?pokemonId=25`.

> Con esto ya tienes las 4 operaciones: `GET`, `POST`, `PATCH` y `DELETE` sobre `/favoritos`. JSON Server guarda los cambios en `db.json`.

## Paso 3. Estructura del frontend

Crea las carpetas y archivos vacíos:

```
frontend/
  index.html
  detalle.html
  buscar.html
  favoritos.html
  serve.json
  css/estilos.css
  js/api.js
  js/index.js
  js/detalle.js
  js/buscar.js
  js/favoritos.js
```

En `frontend/serve.json` escribe `{ "cleanUrls": false }` para que `serve` no quite el `.html` de las URLs.

En otra terminal (la del backend sigue abierta):

```bash
npm run web
```

## Paso 4. La plantilla HTML (se repite en las 4 páginas)

Empieza por `index.html`. En el `<head>` van las librerías por CDN, sin instalar nada:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<link rel="stylesheet" href="css/estilos.css">
```

En el `<body>`: un `<header>` con la navegación (enlaces normales a `index.html`, `buscar.html` y `favoritos.html`) y un `<main>` con contenedores vacíos que JS llenará, por ejemplo `<ul id="lista"></ul>`.

Al final del `<body>`, los scripts. **Siempre `api.js` primero**, porque los demás usan sus funciones:

```html
<script src="js/api.js"></script>
<script src="js/index.js"></script>
```

**Prueba:** pon un `<h1 class="text-3xl font-bold text-red-600">Hola</h1>`. Si sale grande y rojo, Tailwind funciona.

Cuando la cabecera te guste, copia el archivo como base para las otras tres páginas y cambia el `<main>` y el script de cada una.

## Paso 5. `api.js`: todas las peticiones en un solo lugar

Define las dos URL base:

```js
const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const API_URL = 'http://localhost:3000';
```

Escribe una función `async` por operación, todas con el mismo patrón:

```js
async function obtenerPokemon(nombreOId) {
  const respuesta = await fetch(`${POKEAPI_URL}/pokemon/${nombreOId}`);
  if (!respuesta.ok) throw new Error('Pokémon no encontrado');
  return respuesta.json();
}
```

Lista de funciones que necesitas:

| Función                            | Petición                                                         |
| ----------------------------------- | ----------------------------------------------------------------- |
| `obtenerPokemones(offset, limit)` | `GET POKEAPI/pokemon?offset=&limit=`                            |
| `obtenerPokemon(nombreOId)`       | `GET POKEAPI/pokemon/:id`                                       |
| `obtenerFavoritos()`              | `GET API/favoritos`                                             |
| `buscarFavorito(pokemonId)`       | `GET API/favoritos?pokemonId=` (devuelve el primero o `null`) |
| `crearFavorito(favorito)`         | `POST API/favoritos`                                            |
| `actualizarFavorito(id, datos)`   | `PATCH API/favoritos/:id`                                       |
| `eliminarFavorito(id)`            | `DELETE API/favoritos/:id`                                      |

Para `POST` y `PATCH` hay que mandar el cuerpo como JSON:

```js
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(favorito),
});
```

Y unas ayudas: `idDesdeUrl(url)`, `imagenPokemon(id)`, `formatearNumero(id)`, `tarjetaPokemon(id, nombre)` (devuelve el HTML de una tarjeta) y `mostrarError(mensaje)` (con `Swal.fire`).

**Prueba:** abre la consola del navegador en `index.html` y ejecuta `await obtenerPokemon('pikachu')` y `await obtenerFavoritos()`.

## Paso 6. Vista 1: listado (`index.js`)

1. Lee la página de la URL: `new URLSearchParams(location.search).get('pagina')`.
2. Calcula `offset = (pagina - 1) * 24` y llama a `obtenerPokemones(offset, 24)`.
3. Recorre `results`, arma el HTML con `tarjetaPokemon` y asígnalo a `lista.innerHTML`.
4. Pon los `href` de "Anterior" y "Siguiente" (`index.html?pagina=N`). Oculta el que no aplique.
5. Añade `animate__animated animate__fadeIn` a la lista para que aparezca suave.

**Prueba:** [http://localhost:5500/index.html?pagina=2](http://localhost:5500/index.html?pagina=2).

## Paso 7. Vista 2: detalle (`detalle.js`) — aquí está el CREATE

1. Lee `?id=` de la URL y llama a `obtenerPokemon(id)`.
2. Pinta la imagen, el nombre, los tipos (`types`), la altura y el peso (vienen en decímetros y hectogramos: divide entre 10) y las estadísticas (`stats`) como barras con `style="width: X%"`.
3. Llama a `buscarFavorito(pokemon.id)` para saber si ya es favorito y cambiar el texto del botón.
4. Al hacer clic:
   - Si **no** es favorito: pide un apodo con `Swal.fire({ input: 'text', showCancelButton: true })` y llama a `crearFavorito(...)`.
   - Si **ya** es favorito: `eliminarFavorito(favorito.id)`.

**Prueba:** agrega uno desde [http://localhost:5500/detalle.html?id=6](http://localhost:5500/detalle.html?id=6) y mira cómo cambia `db.json`.

## Paso 8. Vista 3: búsqueda (`buscar.js`)

1. En `buscar.html`, un `<form action="buscar.html" method="get">` con un `<input name="q">`. Al enviarlo, el navegador va a `buscar.html?q=lo-que-escribiste`; no hace falta `preventDefault`.
2. En JS, lee `q`. Si está vacío, no hagas nada.
3. La PokeAPI no busca por partes del nombre, así que pide la lista completa (`obtenerPokemones(0, 2000)`) y usa `filter` con `nombre.includes(texto)` o con el número exacto.
4. Sin resultados → `Swal.fire({ icon: 'info', ... })`.

**Prueba:** busca `char`, `saur` y `150`.

## Paso 9. Vista 4: favoritos (`favoritos.js`) — READ, UPDATE y DELETE

1. **READ:** `obtenerFavoritos()` y pinta una tarjeta por favorito. Si la lista está vacía, muestra un mensaje con un enlace al listado.
2. Guarda la lista en una variable global `favoritos` para encontrar después cada uno con `favoritos.find(f => f.id === id)`.
3. Cada tarjeta tiene dos botones con `onclick="editarApodo('ID')"` y `onclick="borrarFavorito('ID')"`.
4. **UPDATE:** `Swal.fire` con `input: 'text'` e `inputValue` con el apodo actual → `actualizarFavorito(id, { apodo })` → vuelve a cargar la lista.
5. **DELETE:** `Swal.fire` con `icon: 'warning'` y `showCancelButton` → si confirma, `eliminarFavorito(id)` → vuelve a cargar.

**Prueba:** edita y borra favoritos, y revisa `db.json` después de cada acción.

## Paso 10. Repaso final

- [ ] Apaga `npm run api` y entra a Favoritos: ¿sale un mensaje de error claro?
- [ ] Abre `detalle.html?id=99999`: ¿se ve "No encontramos ese pokémon"?
- [ ] ¿Funciona en el móvil? (en DevTools, el icono de dispositivo).
- [ ] ¿Las 4 páginas tienen la misma navegación?

## Conceptos que practicaste

`fetch` con `async/await` y `try/catch` · métodos HTTP y REST · `URLSearchParams` para pasar datos entre páginas · `map`, `filter` y `find` · template literals para generar HTML · `innerHTML` y eventos · librerías por CDN.
