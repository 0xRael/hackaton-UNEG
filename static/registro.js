const formulario = document.querySelector("#formulario");

formulario.addEventListener("submit", validnombre)

function validnombre(e){
    e.preventDefault();
    const nombre = document.querySelector("#nombreusuario").value;
    const correo = document.querySelector("#correo").value;
    const contraseña = document.querySelector("#contraseña").value;
    const genero = document.querySelector("#genero").value;

    if(genero === "Seleccion"){
        alert("Por favor, seleccione un genero");
    }

    console.log(nombre,correo,contraseña,genero);
}