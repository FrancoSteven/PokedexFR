// REFERENCIA AL DOM
        const contenedor = document.getElementById("pokedex");

        const agregarBtn = document.getElementById("agregarBtn");
        const quitarBtn = document.getElementById("quitarBtn");
        const buscarBtn = document.getElementById("buscarBtn");
        const buscador = document.getElementById("buscador");

        let contadorPokemon = 1; // Empeazamos desde la ID 1

// Funcion para consumir una API

        async function obtenerPokemon(id) {
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                const data = await res.json();

                return {
                    nombre: data.name,
                    imagen: data.sprites.other["official-artwork"].front_default,
                    tipo: data.types.map(t => t.type.name).join(", "),
                    tipos: data.types.map(t => t.type.name),
                    experiencia: data.base_experience,
                    peso: data.weight,
                    altura: data.height,
                    habilidades: data.abilities.map(a => a.ability.name), // <- Habilidades añadidas
                    habilidades: data.abilities.map(a => a.ability.name), // <- Habilidades añadidas

                    habilidadesOcultas: data.abilities
                    .filter(a => a.is_hidden)
                    .map(a => a.ability.name) // Habilidades ocultas
                };
            } catch (error) {
                alert("Pokémon no encontrado");
                return null;
            }
        }


/// funcion para crear cartas con BOOTSTRAP

        function crearCarta(pokemon) {
            const div = document.createElement("div");
            div.classList.add("col");

            const tipoPrincipal = pokemon.tipos[0];
            const tipoClase = tipoPrincipal ? `bg-${tipoPrincipal}` : "";

            div.innerHTML = `

                <div class="card h-100 shadow-sm ${tipoClase}">
                    <img src= ${pokemon.imagen} class="card-img-top bg-white style="object-fit: contain; height: 200px; alt="${pokemon.nombre}>
                    <div class="card-body">
                        <h5 class="card-title text-capitalize">${pokemon.nombre}</h5>
                        <p class="card-text"><strong>Tipo:</strong> ${pokemon.tipo}</p>
                        <p class="card-text"><strong>Exp:</strong> ${pokemon.experiencia}</p>
                        <p class="card-text"><strong>Peso:</strong> ${pokemon.peso} | <strong>Altura:</strong> ${pokemon.altura}</p>
                        <p class="card-text"><strong>Habilidad:</strong> ${pokemon.habilidades}</p>
                </div>
            </div>

            `;

            return div;
        }

        agregarBtn.addEventListener("click", async () => {
            const pokemon = await obtenerPokemon(contadorPokemon);
            if (pokemon) {
                const carta = crearCarta(pokemon);
                contenedor.appendChild(carta);
                contadorPokemon++;
            }
        });

        quitarBtn.addEventListener("click", () => {
            const cartas = contenedor.querySelectorAll(".col");
            if (cartas.length > 0) {
                cartas[cartas.length - 1].remove();
                contadorPokemon--;
            }
        });

        buscarBtn.addEventListener("click", async () => {
            const valor = buscador.value.toLowerCase().trim();
            if (!valor) return;

            const pokemon = await obtenerPokemon(valor);
            if (pokemon) {
                const carta = crearCarta(pokemon);
                contenedor.appendChild(carta);
            }

        });

    

