document.addEventListener("DOMContentLoaded", () => {
  const botonEditar = document.getElementById("boton-editar");
  const botonGuardar = document.getElementById("guardar");
  const subirFotoLabel = document.querySelector(".boton-subir-foto");
  const subirFotoInput = document.getElementById("subir-foto");

  const campos = [
    document.getElementById("nombre"),
    document.getElementById("correo"),
    document.getElementById("user-description")
  ];

  botonEditar.addEventListener("click", () => {
    campos.forEach(campo => campo.disabled = false);
    botonGuardar.style.display = "inline-block";
    subirFotoLabel.style.display = "flex";
  });

  // Opcional: previsualizar imagen seleccionada
  subirFotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function () {
        document.querySelector(".foto-usuario").src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });
});
