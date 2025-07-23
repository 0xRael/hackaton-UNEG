document.getElementById('service-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('service-title').value.trim();
  const descripcion = document.getElementById('service-description').value.trim();
  const precio = parseFloat(document.getElementById('service-price').value);
  const duracion = document.getElementById('service-duration').value;
  const aDomicilio = document.getElementById('service-delivery').checked;





  if (!titulo || !descripcion || isNaN(precio)) return;

  const nuevoServicio = {titulo, descripcion, precio, duracion, domicilio: aDomicilio};

  const item = document.createElement('li');
  item.innerHTML = `
    <strong>${nuevoServicio.titulo}</strong><br>
    ${nuevoServicio.descripcion}<br>
    <em>Precio:</em> Bs ${nuevoServicio.precio.toFixed(2)} —
    <em>Duración:</em> ${nuevoServicio.duracion}
  `;
  document.getElementById('services').appendChild(item);

  document.getElementById('service-form').reset();
});
