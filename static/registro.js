const formulario = document.querySelector("#formulario");

formulario.addEventListener("submit", validnombre)

function validnombre(e){
    e.preventDefault();
    const genero = document.querySelector("#genero").value;

    if(genero === "Seleccion"){
        alert("Por favor, seleccione un genero");
        return;
    }
    
    formulario.submit(); // Enviar el formulario si todo es correcto
}