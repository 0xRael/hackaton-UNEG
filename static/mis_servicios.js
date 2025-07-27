/**
 * app.js
 * - carga la lista de servicios
 * - carga la ganancia total por cada servicio
 * - elimina cualquier referencia a calendario
 */

document.addEventListener('DOMContentLoaded', () => {
  cargarServicios();
  cargarGananciasPorServicio();
});


// 1) Traer y mostrar los servicios en #lista-servicios
async function cargarServicios() {
  const ulServicios = document.getElementById('lista-servicios');
  ulServicios.innerHTML = '<li>Cargando servicios…</li>';

  try {
    const res = await fetch('/api/servicios');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const servicios = await res.json();  
    // espera un array, e.g. [ { id:1, nombre:'Corte de pelo' }, ... ]

    ulServicios.innerHTML = '';
    servicios.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s.nombre;
      ulServicios.appendChild(li);
    });

  } catch (err) {
    console.error('Error al cargar servicios:', err);
    ulServicios.innerHTML = '<li>Error al cargar servicios</li>';
  }
}


// 2) Traer y mostrar la ganancia total de cada servicio en #lista-ganancias
async function cargarGananciasPorServicio() {
  const ul = document.getElementById('lista-ganancias');
  ul.innerHTML = '<li>Cargando ganancias…</li>';

  try {
    const res = await fetch('/api/ganancias/servicios');
    if (res.status === 404) {
      throw new Error('Endpoint no encontrado (404). Revisa la ruta en tu servidor.');
    }
    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }
    const data = await res.json();
    ul.innerHTML = '';
    Object.entries(data).forEach(([serv, total]) => {
      const li = document.createElement('li');
      li.textContent = `${serv}: $ ${Number(total).toFixed(2)}`;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error('Error al cargar ganancias:', err);
    ul.innerHTML = `<li>${err.message}</li>`;
  }
}

