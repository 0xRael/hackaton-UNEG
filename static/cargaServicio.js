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

  const form = document.getElementById('service-form');
  const formData = new FormData(form);
  formData.append('a_domicilio', document.getElementById('service-delivery').checked ? "Si" : "No");

  let url = '/api/servicios';
  let method = 'POST';
  if (editandoId !== null) {
    url = `/api/servicios/${editandoId}`;
    method = 'PUT';
  }

  await fetch(url, {
    method: method,
    body: formData
  });

  editandoId = null;
  await cargarServicios();
  form.reset();
  document.getElementById('img-preview').src = "#";
  document.getElementById('img-preview').style.display = 'none';
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
  document.getElementById('service-category').value = serv.duracion;
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
