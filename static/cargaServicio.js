let servicios = [];
let editandoIndex = null;

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

document.getElementById('service-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('service-title').value;
  const descripcion = document.getElementById('service-description').value;
  const precio = parseFloat(document.getElementById('service-price').value);
  const category = document.getElementById('service-category').value;
  const aDomicilio = document.getElementById('service-delivery').checked;
  const imagen = document.getElementById('img-preview').src;

  if (!titulo || !descripcion || isNaN(precio) || !category || imagen === "#") return;

  const nuevoServicio = { titulo, descripcion, precio, category, domicilio: aDomicilio, imagen };

  if (editandoIndex !== null) {
    servicios[editandoIndex] = nuevoServicio;
    editandoIndex = null;
  } else {
    servicios.push(nuevoServicio);
  }

  renderizarServicios();
  document.getElementById('service-form').reset();
  document.getElementById('img-preview').src = "#";
  document.getElementById('img-preview').style.display = 'none';
});

function renderizarServicios() {
  const lista = document.getElementById('services');
  lista.innerHTML = "";

  servicios.forEach((serv, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <div class="service-card">
        <div class="service-img">
          <img src="${serv.imagen}" alt="Imagen del servicio" />
        </div>
        <div class="service-info">
          <h2>${serv.titulo}</h2>
          <p>${serv.descripcion}</p>
          <p><strong>Precio:</strong> Bs ${serv.precio.toFixed(2)}</p>
          <p><strong>Categoría:</strong> ${serv.category}</p>
          <p><strong>A domicilio:</strong> ${serv.domicilio ? "Disponible 🏠" : "No disponible ❌"}</p>
          <div class="service-actions">
            <button type="button" class="btn-edit" onclick="editarServicio(${index})">✏️ Editar</button>
            <button type="button" class="btn-delete" onclick="eliminarServicio(${index})">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
    lista.appendChild(item);
  });
}

function eliminarServicio(index) {
  servicios.splice(index, 1);
  renderizarServicios();
}

function editarServicio(index) {
  const serv = servicios[index];
  document.getElementById('service-title').value = serv.titulo;
  document.getElementById('service-description').value = serv.descripcion;
  document.getElementById('service-price').value = serv.precio;
  document.getElementById('service-category').value = serv.category;
  document.getElementById('service-delivery').checked = serv.domicilio;
  document.getElementById('img-preview').src = serv.imagen;
  document.getElementById('img-preview').style.display = "block";
  editandoIndex = index;
}
