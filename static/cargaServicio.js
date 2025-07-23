document.getElementById('service-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('service-title').value;
  const descripcion = document.getElementById('service-description').value;
  const precio = parseFloat(document.getElementById('service-price').value);
  const duracion = document.getElementById('service-duration').value;
  const aDomicilio = document.getElementById('service-delivery').checked;

  if (!titulo || !descripcion || isNaN(precio)) return;

  document.getElementById('service-form').submit();
});
