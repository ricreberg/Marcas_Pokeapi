window.addEventListener("DOMContentLoaded", function() {

    // Elementos del DOM ya existentes
    let btnPeticion = document.getElementById("btnPedir");
    let inputPokemon = document.getElementById("numeroPokemon");
    let imgPokemon = document.getElementById("imagenPokemon");
    let divInfo = document.getElementById("infoPokemon");

    // Nuevos elementos del DOM para el registro
    let formRegistro = document.getElementById("formularioRegistro");
    let formShiny = document.getElementById("formShiny");
    let txtNombrePokemon = document.getElementById("registroNombrePokemon");
    let inputFecha = document.getElementById("fechaCaptura");
    let inputResets = document.getElementById("resets");
    let selectJuego = document.getElementById("juegoOrigen");
    let btnCancelar = document.getElementById("btnCancelar");
    let divListaShinies = document.getElementById("listaShinies");
    let contadorShinies = document.getElementById("contadorShinies");
    let filtroShinies = document.getElementById("filtroShinies");

    // Variables temporales para guardar los datos del Pokémon buscado actualmente
    let currentPokemonName = "";
    let currentPokemonImg = "";

    // Array para guardar los shinies, cargando desde LocalStorage si existe (XML/JSON en el temario)
    let misShinies = JSON.parse(localStorage.getItem("misShinies")) || [];

    // Mostrar los shinies guardados al cargar la página
    actualizarLista();

    // Eventos de búsqueda
    btnPeticion.addEventListener("click", pedirPokemon);

    inputPokemon.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            pedirPokemon();
        }
    });

    function pedirPokemon() {
        let nombrePokemon = inputPokemon.value.toLowerCase().trim();

        if (nombrePokemon === "") {
            return;
        }

        fetch("https://pokeapi.co/api/v2/pokemon/" + nombrePokemon)
        .then(res => {
            if(!res.ok) {
                throw new Error("Pokemon no encontrado");
            }
            return res.json();
        })
        .then(data => {
            mostrarDatos(data);
        })
        .catch(error => {
            imgPokemon.src = "";
            imgPokemon.style.display = "none";
            divInfo.innerHTML = `<p style="color:red;"> ${error.message} </p>`;
        });
    }

    function mostrarDatos(data) {
        let urlShiny = data.sprites.front_shiny;
        let urlNormal = data.sprites.front_default;

        // Si no tiene sprite shiny, intentamos usar el normal y viceversa para evitar errores
        if (!urlShiny) urlShiny = urlNormal;
        if (!urlNormal) urlNormal = urlShiny;

        imgPokemon.src = urlShiny;
        imgPokemon.style.display = "inline";
        imgPokemon.dataset.isShiny = "true";

        let nombre = data.name.toUpperCase();
        let altura = data.height / 10 + " m";
        let peso = data.weight / 10 + " kg";

        // Guardamos los datos del Pokémon actual en las variables temporales
        currentPokemonName = data.name;
        currentPokemonImg = urlShiny;

        // Limpiamos y rellenamos el select de juegos (Criterio: Manipulación DOM)
        selectJuego.innerHTML = "";
        let arrayJuegos = [];
        
        if (data.game_indices && data.game_indices.length > 0) {
            for (let item of data.game_indices) {
                arrayJuegos.push(item.version.name.toUpperCase());
            }
        } else {
            // PokeAPI no tiene game_indices para Gen 7+. Añadimos lista manual de juegos modernos.
            arrayJuegos = ["SUN", "MOON", "ULTRA-SUN", "ULTRA-MOON", "SWORD", "SHIELD", "BRILLIANT-DIAMOND", "SHINING-PEARL", "LEGENDS-ARCEUS", "SCARLET", "VIOLET"];
        }

        for (let juego of arrayJuegos) {
            let opt = document.createElement("option");
            opt.value = juego.toLowerCase();
            opt.textContent = juego;
            selectJuego.appendChild(opt);
        }

        // Extraemos los tipos
        let tipos = "";
        for (let item of data.types) {
            tipos += item.type.name.toUpperCase() + " ";
        }

        // Extraemos TODAS las estadísticas base
        let statsHtml = "<div style='margin-top: 1rem; margin-bottom: 1rem; text-align: left; padding: 0 1rem;'>";
        for (let stat of data.stats) {
            let width = stat.base_stat > 150 ? 100 : (stat.base_stat / 150) * 100; // Escalamos para que los grandes ocupen casi todo
            let statName = stat.stat.name.toUpperCase();
            if (statName === "SPECIAL-ATTACK") statName = "SP. ATK";
            if (statName === "SPECIAL-DEFENSE") statName = "SP. DEF";

            statsHtml += "<div class='stat-row'>";
            statsHtml += "<span style='font-size: 0.8rem; font-weight: bold;'>" + statName + ": " + stat.base_stat + "</span>";
            statsHtml += "<div class='stat-bar-bg'><div class='stat-bar-fill' style='width: " + width + "%;'></div></div>";
            statsHtml += "</div>";
        }
        statsHtml += "</div>";

        // Renderizamos la info
        divInfo.innerHTML = "<p><strong>" + nombre + "</strong></p>" +
                            "<p><strong> Altura: " + altura + "</strong></p>" +
                            "<p><strong>Peso: " + peso + "</strong></p>" +
                            "<p><strong>Tipo(s): " + tipos + "</strong></p>" +
                            statsHtml;

        // Botón toggle Normal/Shiny
        let btnToggle = document.createElement("button");
        btnToggle.textContent = "Ver Normal";
        btnToggle.style.display = "block";
        btnToggle.style.margin = "0 auto 10px auto";
        btnToggle.addEventListener("click", function() {
            if (imgPokemon.dataset.isShiny === "true") {
                imgPokemon.src = urlNormal;
                imgPokemon.dataset.isShiny = "false";
                btnToggle.textContent = "Ver Shiny";
            } else {
                imgPokemon.src = urlShiny;
                imgPokemon.dataset.isShiny = "true";
                btnToggle.textContent = "Ver Normal";
            }
        });
        divInfo.appendChild(btnToggle);

        // Crear el botón "¡Lo atrapé!" dinámicamente
        let btnAtrapado = document.createElement("button");
        btnAtrapado.textContent = "¡Lo atrapé!";
        btnAtrapado.id = "btnAtrapado";
        btnAtrapado.addEventListener("click", abrirFormulario);
        divInfo.appendChild(btnAtrapado);
    }

    function abrirFormulario() {
        // Rellenar la fecha con el día actual automáticamente
        let hoy = new Date().toISOString().split('T')[0];
        inputFecha.value = hoy;

        txtNombrePokemon.innerHTML = "Registrando a: <strong>" + currentPokemonName.toUpperCase() + "</strong> Shiny";
        formRegistro.style.display = "block";
        
        // Desplazar suavemente la pantalla hacia el formulario
        formRegistro.scrollIntoView({ behavior: 'smooth' });
    }

    // Evento para enviar el formulario y guardar el Shiny
    formShiny.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitamos que la página se recargue (visto en Event)

        let nuevoShiny = {
            nombre: currentPokemonName,
            imagen: currentPokemonImg,
            fecha: inputFecha.value,
            resets: Number(inputResets.value),
            juego: selectJuego.value
        };

        // Añadimos al array y guardamos en LocalStorage
        misShinies.push(nuevoShiny);
        localStorage.setItem("misShinies", JSON.stringify(misShinies));

        // Limpiar formulario y ocultarlo
        formRegistro.style.display = "none";
        inputResets.value = "0";

        // Actualizar la vista de la lista
        actualizarLista();
    });

    // Evento para cancelar el formulario
    btnCancelar.addEventListener("click", function() {
        formRegistro.style.display = "none";
        inputResets.value = "0";
    });

    // Evento del buscador de shinies
    filtroShinies.addEventListener("input", function() {
        actualizarLista(this.value.toLowerCase());
    });

    // Función para renderizar la lista de "Mis Shinies"
    function actualizarLista(textoFiltro = "") {
        divListaShinies.innerHTML = ""; // Limpiamos la lista anterior

        // Aplicamos el filtro si hay texto
        let listaFiltrada = misShinies;
        if (textoFiltro !== "") {
            listaFiltrada = misShinies.filter(function(shiny) {
                return shiny.nombre.toLowerCase().includes(textoFiltro);
            });
        }

        // Actualizamos el contador
        contadorShinies.textContent = "Total registrados: " + listaFiltrada.length;

        if (listaFiltrada.length === 0) {
            divListaShinies.innerHTML = "<p style='color: #777;'>No hay Shinies que mostrar.</p>";
            return;
        }

        // Recorremos el array filtrado usando un bucle for...of (visto en Bucles)
        for (let shiny of listaFiltrada) {
            let tarjeta = document.createElement("div");
            tarjeta.className = "tarjetaShiny";

            let img = document.createElement("img");
            img.src = shiny.imagen;
            img.alt = shiny.nombre;
            img.className = "imagenLista";

            let info = document.createElement("div");
            info.className = "infoLista";
            info.innerHTML = "<p><strong>" + shiny.nombre.toUpperCase() + "</strong></p>" +
                             "<p>Fecha: " + shiny.fecha + "</p>" +
                             "<p>Soft Resets: " + shiny.resets + "</p>" +
                             "<p>Juego: " + (shiny.juego ? shiny.juego.toUpperCase() : "DESCONOCIDO") + "</p>";

            // Botón para borrar un shiny si el usuario se equivoca
            let btnBorrar = document.createElement("button");
            btnBorrar.textContent = "Borrar";
            btnBorrar.className = "btnBorrar";
            btnBorrar.addEventListener("click", function() {
                // Filtramos el array usando filter() (visto en métodos de arrays)
                misShinies = misShinies.filter(function(item) {
                    return item !== shiny;
                });
                // Guardamos en local storage y actualizamos la lista
                localStorage.setItem("misShinies", JSON.stringify(misShinies));
                actualizarLista();
            });

            tarjeta.appendChild(img);
            tarjeta.appendChild(info);
            tarjeta.appendChild(btnBorrar);
            divListaShinies.appendChild(tarjeta);
        }
    }

});