// REFERENCIA AL DOM
const contenedor = document.getElementById("pokedex");
const agregarBtn = document.getElementById("agregarBtn");
const quitarBtn = document.getElementById("quitarBtn");
const buscarBtn = document.getElementById("buscarBtn");
const buscador = document.getElementById("buscador");
const filtroTipoSelect = document.getElementById("filtroTipo");
const favoritosBtn = document.getElementById("favoritosBtn");
const favoritosContainer = document.getElementById("favoritosContainer");
const pokedexContainer = document.getElementById("pokedex");
const limpiarPokedexBtn = document.getElementById("limpiarPokedexBtn"); // Nuevo botón

let contadorPokemon = 1; // Empezamos desde la ID 1
let pokemonMostrados = []; // Array para almacenar los Pokémon mostrados y poder filtrarlos

// Funcion para consumir una API
async function obtenerPokemon(id) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) {
            throw new Error("Pokémon no encontrado");
        }
        const data = await res.json();

        return {
            id: data.id, // Añadido para el buscador por ID y favoritos
            nombre: data.name,
            imagen: data.sprites.other["official-artwork"].front_default,
            tipo: data.types.map(t => t.type.name).join(", "),
            tipos: data.types.map(t => t.type.name),
            experiencia: data.base_experience,
            peso: data.weight / 10, // Convertir de decagramos a kg
            altura: data.height / 10, // Convertir de decímetros a metros
            habilidades: data.abilities.map(a => a.ability.name).join(", "),
        };
    } catch (error) {
        alert("Pokémon no encontrado. Intenta con otro nombre o ID.");
        return null;
    }
}

/// Funcion para crear cartas con BOOTSTRAP
function crearCarta(pokemon, esFavorito = false) {
    const div = document.createElement("div");
    div.classList.add("col", "pokemon-card-animate"); // Clase para la animación
    div.setAttribute("data-pokemon-id", pokemon.id); // Añadir ID al elemento

    const tipoPrincipal = pokemon.tipos[0];
    const tipoClase = tipoPrincipal ? `bg-${tipoPrincipal}` : "";

    // Botón de favoritos
    const iconoFavorito = esFavorito ? '❤️' : '🤍'; // Corazón lleno o vacío
    const botonFavorito = `
        <button class="btn btn-sm btn-light favorito-btn" data-pokemon-id="${pokemon.id}">
            ${iconoFavorito}
        </button>
    `;

    div.innerHTML = `
        <div class="card h-100 shadow-sm ${tipoClase}">
            <img src="${pokemon.imagen}" class="card-img-top bg-white" style="object-fit: contain; height: 200px;" alt="${pokemon.nombre}">
            <div class="card-body">
                <h5 class="card-title text-capitalize">${pokemon.nombre} <small class="text-muted">#${pokemon.id}</small></h5>
                <p class="card-text"><strong>Tipo:</strong> ${pokemon.tipo}</p>
                <p class="card-text"><strong>Exp:</strong> ${pokemon.experiencia}</p>
                <p class="card-text"><strong>Peso:</strong> ${pokemon.peso} kg | <strong>Altura:</strong> ${pokemon.altura} m</p>
                <p class="card-text"><strong>Habilidades:</strong> ${pokemon.habilidades}</p>
                ${botonFavorito}
            </div>
        </div>
    `;

    // Añadir evento al botón de favorito
    const favButton = div.querySelector('.favorito-btn');
    favButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que el clic se propague y afecte otros eventos
        toggleFavorito(pokemon.id, pokemon);
        // Actualizar el icono del corazón inmediatamente
        favButton.innerHTML = estaEnFavoritos(pokemon.id) ? '❤️' : '🤍';
    });

    return div;
}

// Función para renderizar Pokémon en el contenedor principal
function renderizarPokemon(pokemonData) {
    contenedor.innerHTML = ''; // Limpiar el contenedor actual
    pokemonData.forEach(pokemon => {
        const esFavorito = estaEnFavoritos(pokemon.id);
        const carta = crearCarta(pokemon, esFavorito);
        contenedor.appendChild(carta);
    });
}

// Cargar Pokémon iniciales
async function cargarPokemonIniciales(cantidad) {
    for (let i = 1; i <= cantidad; i++) {
        const pokemon = await obtenerPokemon(i);
        if (pokemon) {
            pokemonMostrados.push(pokemon);
        }
    }
    renderizarPokemon(pokemonMostrados);
    contadorPokemon = cantidad + 1; // Actualizar el contador para el botón "Agregar"
}

// Función para filtrar Pokémon por tipo
function filtrarPokemonPorTipo(tipo) {
    let pokemonFiltrados = [];
    if (tipo === "todos") {
        pokemonFiltrados = pokemonMostrados;
    } else {
        pokemonFiltrados = pokemonMostrados.filter(pokemon => pokemon.tipos.includes(tipo));
    }
    renderizarPokemon(pokemonFiltrados);
}

// Funciones de localStorage para favoritos
function getFavoritos() {
    const favoritos = localStorage.getItem('pokemonFavoritos');
    return favoritos ? JSON.parse(favoritos) : {};
}

function setFavoritos(favoritos) {
    localStorage.setItem('pokemonFavoritos', JSON.stringify(favoritos));
}

function estaEnFavoritos(id) {
    const favoritos = getFavoritos();
    return favoritos.hasOwnProperty(id);
}

async function toggleFavorito(id, pokemonData) {
    let favoritos = getFavoritos();
    if (favoritos.hasOwnProperty(id)) {
        delete favoritos[id];
        // alert(`${pokemonData.nombre} ha sido eliminado de tus favoritos.`); // Desactivado para UX
    } else {
        // Si no tenemos los datos completos del Pokémon, los obtenemos
        if (!pokemonData) {
            pokemonData = await obtenerPokemon(id);
        }
        if (pokemonData) {
            favoritos[id] = pokemonData;
            // alert(`${pokemonData.nombre} ha sido añadido a tus favoritos.`); // Desactivado para UX
        }
    }
    setFavoritos(favoritos);
    // Si estamos en la sección de favoritos, la actualizamos
    if (favoritosContainer.classList.contains('active')) { // 'active' es una clase que puedes añadir en CSS o JS para indicar visibilidad
        mostrarFavoritos();
    }
}

// Mostrar sección de favoritos
function mostrarFavoritos() {
    pokedexContainer.classList.add('d-none');
    favoritosContainer.classList.remove('d-none');
    favoritosContainer.classList.add('active'); // Añadir clase 'active'
    favoritosContainer.innerHTML = '<h2>Mis Pokémon Favoritos</h2><div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4" id="listaFavoritos"></div>';
    const listaFavoritos = document.getElementById('listaFavoritos');
    const favoritos = getFavoritos();
    if (Object.keys(favoritos).length === 0) {
        listaFavoritos.innerHTML = '<p class="col-12 text-center">No tienes Pokémon favoritos aún.</p>';
    } else {
        for (const id in favoritos) {
            const carta = crearCarta(favoritos[id], true); // true indica que es un favorito
            listaFavoritos.appendChild(carta);
        }
    }
}

// Mostrar sección de Pokédex
function mostrarPokedex() {
    pokedexContainer.classList.remove('d-none');
    favoritosContainer.classList.add('d-none');
    favoritosContainer.classList.remove('active'); // Quitar clase 'active'
    renderizarPokemon(pokemonMostrados); // Volver a renderizar los Pokémon mostrados en la Pokedex
}


// Event Listeners
agregarBtn.addEventListener("click", async () => {
    const pokemon = await obtenerPokemon(contadorPokemon);
    if (pokemon) {
        pokemonMostrados.push(pokemon);
        const carta = crearCarta(pokemon, estaEnFavoritos(pokemon.id));
        contenedor.appendChild(carta);
        contadorPokemon++;
    }
});

quitarBtn.addEventListener("click", () => {
    const cartas = contenedor.querySelectorAll(".col");
    if (cartas.length > 0) {
        // Añadir clase para la animación de salida
        const ultimaCarta = cartas[cartas.length - 1];
        ultimaCarta.classList.add('pokemon-card-remove');
        ultimaCarta.addEventListener('animationend', () => {
            ultimaCarta.remove();
             // Si el Pokémon removido es el último en pokemonMostrados, decrementamos contadorPokemon
            if (pokemonMostrados.length > 0 && pokemonMostrados[pokemonMostrados.length - 1].id === contadorPokemon - 1) {
                contadorPokemon--;
            }
            // Remover el último Pokémon del array pokemonMostrados
            pokemonMostrados.pop();
        }, { once: true }); // Asegura que el evento se dispare solo una vez
    }
});

buscarBtn.addEventListener("click", async () => {
    const valor = buscador.value.toLowerCase().trim();
    if (!valor) {
        alert("Por favor, ingresa un nombre o ID para buscar.");
        return;
    }

    // Limpiar el contenedor antes de mostrar el resultado de la búsqueda
    contenedor.innerHTML = '';
    pokemonMostrados = []; // Limpiar los Pokémon mostrados para solo tener el resultado de la búsqueda

    const pokemon = await obtenerPokemon(valor);
    if (pokemon) {
        pokemonMostrados.push(pokemon); // Añadir el Pokémon encontrado al array de mostrados
        const carta = crearCarta(pokemon, estaEnFavoritos(pokemon.id));
        contenedor.appendChild(carta);
    }
    buscador.value = ''; // Limpiar el input del buscador
});

filtroTipoSelect.addEventListener("change", (e) => {
    const tipoSeleccionado = e.target.value;
    if (tipoSeleccionado === "mostrarPokedex") {
        mostrarPokedex();
    } else if (tipoSeleccionado === "mostrarFavoritos") {
        mostrarFavoritos();
    } else {
        mostrarPokedex(); // Asegurarse de que estamos en la pokedex antes de filtrar
        filtrarPokemonPorTipo(tipoSeleccionado);
    }
});

favoritosBtn.addEventListener("click", () => {
    mostrarFavoritos();
});

limpiarPokedexBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres limpiar la Pokédex? Esto eliminará todos los Pokémon mostrados, pero no tus favoritos.")) {
        contenedor.innerHTML = ''; // Elimina todas las tarjetas del DOM
        pokemonMostrados = []; // Vacía el array de Pokémon mostrados
        contadorPokemon = 1; // Reinicia el contador para empezar desde el Pokémon #1
    }
});


// Cargar algunos Pokémon al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarPokemonIniciales(9); // Carga los primeros 9 Pokémon al cargar la página
});