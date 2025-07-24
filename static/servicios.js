const reserva = document.querySelector("#reserva");

reserva.addEventListener("submit", validarFormulario);

function validarFormulario(e) {
  e.preventDefault();

  if (validarFormulario()) {
    // Si el formulario es válido, puedes enviar los datos
    alert("Reserva realizada con éxito.");
  }
}

function validarFormulario() {
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!fecha || !hora) {
    alert("Completa ambos campos antes de reservar.");
    return false;
  }
  return true;
}