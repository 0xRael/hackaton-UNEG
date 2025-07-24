let servicios = [];
let editandoId = null;

// Carga los servicios del servidor
async function cargarServicios() {
  const res = await fetch('/api/servicios');
  servicios = await res.json();
  renderizarServicios();
}

document.getElementById('service-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const titulo = document.getElementById('service-title').value;
  const descripcion = document.getElementById('service-description').value;
  const precio = parseFloat(document.getElementById('service-price').value);
  const categoria = document.getElementById('service-category').value;
  const aDomicilio = document.getElementById('service-delivery').checked ? "Si" : "No";
  const imagenInput = document.getElementById('img-preview');
  const imagen = imagenInput.src && imagenInput.style.display !== 'none' ? imagenInput.src : "";

  const servicio = { titulo, descripcion, precio, categoria, a_domicilio: aDomicilio, imagen };

  if (editandoId !== null) {
    // lo envia al servidor para ser editado
    // metodo PUT = editar
    await fetch(`/api/servicios/${editandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicio)
    });
    editandoId = null;
  } else {
    // lo agrega al servidor
    await fetch('/api/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicio)
    });
  }

  await cargarServicios();
  document.getElementById('service-form').reset();
  imagenInput.src = "#";
  imagenInput.style.display = 'none';
});

function renderizarServicios() {
  const lista = document.getElementById('services');
  lista.innerHTML = "";

  servicios.forEach((serv) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <div class="service-card">
        <div class="service-img">
          <img src="${serv.imagen || '#'}" alt="Imagen del servicio" />
        </div>
        <div class="service-info">
          <h2>${serv.titulo}</h2>
          <p>${serv.descripcion}</p>
          <p><strong>Precio:</strong> $ ${serv.precio}</p>
          <p><strong>Categoría:</strong> ${serv.categoria}</p>
          <p><strong>A domicilio:</strong> ${serv.a_domicilio}</p>
          <div class="service-actions">
            <button type="button" class="btn-edit" onclick="editarServicio(${serv.id})">✏️ Editar</button>
            <button type="button" class="btn-delete" onclick="eliminarServicio(${serv.id})">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
    lista.appendChild(item);
  });
}

window.editarServicio = function(id) {
  const serv = servicios.find(s => s.id === id);
  document.getElementById('service-title').value = serv.titulo;
  document.getElementById('service-description').value = serv.descripcion;
  document.getElementById('service-price').value = serv.precio;
  document.getElementById('service-category').value = serv.categoria;
  document.getElementById('service-delivery').checked = serv.a_domicilio === "Si";
  document.getElementById('img-preview').src = serv.imagen || "#";
  document.getElementById('img-preview').style.display = serv.imagen ? "block" : "none";
  editandoId = id;
};

window.eliminarServicio = async function(id) {
  await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
  await cargarServicios();
};

document.getElementById('imagen').addEventListener('change', function () {
  const archivo = this.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = e => {
      const vista = document.getElementById('img-preview');
      vista.src = e.target.result;
      vista.style.display = 'block';
    };
    lector.readAsDataURL(archivo);
  }
});

window.addEventListener('DOMContentLoaded', cargarServicios);