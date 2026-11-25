# Pokédex MPA

Ejercicio para juniors: una Pokédex hecha con **HTML + JavaScript vanilla**, sin frameworks ni SPA. Cada pantalla es un archivo `.html` distinto (MPA) y los datos viajan por la URL (`?id=25`, `?q=pika`, `?pagina=2`).

- **PokeAPI** para listar, buscar y ver el detalle de los pokémon.
- **JSON Server** como backend propio para el CRUD de favoritos.
- **Tailwind CSS**, **Animate.css** y **SweetAlert2** por CDN (sin compilar nada).

¿Quieres construirla tú desde cero? Sigue la [guía paso a paso](GUIA.md).

## Cómo correrlo

Requisitos: Node.js 18 o superior.

```bash
git clone https://github.com/Janner-GP/pokeapp.git
```

```bash
cd pokeapp
```

```bash
npm install
```

En una terminal, el backend (API de favoritos en `http://localhost:3000/favoritos`):

```bash
npm run api
```

En otra terminal, el frontend (`http://localhost:5500`):

```bash
npm run web
```

> También puedes abrir la carpeta `frontend` con Live Server de VS Code; lo importante es que `npm run api` esté encendido.

## Estructura

```
db.json               ← "base de datos" de JSON Server
frontend/
  index.html          ← listado paginado          (js/index.js)
  buscar.html         ← búsqueda por nombre o nº  (js/buscar.js)
  detalle.html        ← ficha + agregar favorito  (js/detalle.js)
  favoritos.html      ← ver, editar y borrar      (js/favoritos.js)
  js/api.js           ← todos los fetch (PokeAPI y JSON Server)
  css/estilos.css     ← lo poco que Tailwind no cubre
```

## El CRUD de favoritos

| Operación | Método y ruta                 | Dónde se usa   |
|-----------|-------------------------------|----------------|
| Create    | `POST /favoritos`             | `detalle.js`   |
| Read      | `GET /favoritos`, `GET /favoritos?pokemonId=25` | `favoritos.js`, `detalle.js` |
| Update    | `PATCH /favoritos/:id`        | `favoritos.js` |
| Delete    | `DELETE /favoritos/:id`       | `favoritos.js`, `detalle.js` |

Cada favorito guarda: `pokemonId`, `nombre`, `imagen` y `apodo`.

Para usar un backend externo (otro equipo o un servidor desplegado), cambia `API_URL` en `frontend/js/api.js`.

## Ideas para seguir practicando

- Agregar un campo `nota` (1 a 5) al favorito y editarlo.
- Filtrar el listado por tipo (`https://pokeapi.co/api/v2/type/fire`).
- Mostrar un corazón en las tarjetas del listado si el pokémon ya es favorito.
- Escapar el apodo antes de meterlo en `innerHTML` (¿qué pasa si alguien escribe `<b>hola</b>`?).
