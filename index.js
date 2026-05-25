window.addEventListener("DOMContentLoaded", function() {

    let btnPeticion = this.document.getElementById("btnPedir");
    let inputPokemon = this.document.getElementById("numeroPokemon");
    let imgPokemon = this.document.getElementById("imagenPokemon");
    let divInfo = this.document.getElementById("infoPokemon");

    btnPeticion.addEventListener("click", pedirPokemon);

    function pedirPokemon() {
        
        let nombrePokemon = inputPokemon.value.toLowerCase();

        fetch("https://pokeapi.co/api/v2/pokemon/" + nombrePokemon)
        .then(res => {
            if(!res.ok) {
                throw new Error("Pokemon no encontrado");
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            mostrarDatos(data);

        })
        .catch(error => {
            imgPokemon.src = "";
            divInfo.innerHTML = `<p style="color:red;"> ${error.message} </p>`;
        })

    }

    function mostrarDatos(data) {

        let urlImagen = data.sprites.front_default;

        imgPokemon.src = urlImagen;

        let nombre = data.name.toUpperCase();
        let altura = data.height / 10 + " m";
        let peso = data.weight / 10 + " kg";

        divInfo.innerHTML = " <p><strong>" + nombre + 
            "</strong></p><p><strong> Altura: " + altura + 
            "</strong></p><p><strong>Peso: " + peso + "</strong></p>"

    }

})