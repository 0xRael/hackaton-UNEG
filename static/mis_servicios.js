let servicios = [];
let editandoId = null;

// ================== CARGAR SERVICIOS Y GANANCIAS ==================
async function cargarServicios() {
  const res = await fetch('/api/servicios');
  servicios = await res.json();
  await cargarGanancias();
  renderizarServicios();
}

async function cargarGanancias() {
  const res = await fetch('/api/ganancias');
  if (!res.ok) return;

  const ganancias = await res.json();
  const contenedor = document.getElementById('revenue-summary');
  contenedor.innerHTML = "<h3>Ganancias por usuario:</h3>";

  Object.entries(ganancias).forEach(([usuario, monto]) => {
    const item = document.createElement('p');
    item.textContent = `${usuario}: $${monto}`;
    contenedor.appendChild(item);
  });
}

// ================== IMAGEN PREVIEW & VALIDACIÓN ==================
document.getElementById('imagen').addEventListener('change', function () {
  const archivo = this.files[0];
  const maxSize = 500 * 1024; // 500 KB
  if (archivo && archivo.size > maxSize) {
    alert("La imagen es demasiado grande. El tamaño máximo es 500 KB.");
    this.value = "";
    document.getElementById('img-preview').style.display = 'none';
    return;
  }

  const lector = new FileReader();
  lector.onload = e => {
    const vista = document.getElementById('img-preview');
    vista.src = e.target.result;
    vista.style.display = 'block';
  };
  lector.readAsDataURL(archivo);
});

// ================== GUARDAR SERVICIO ==================
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

  await fetch(url, { method, body: formData });
  editandoId = null;
  form.reset();
  document.getElementById('img-preview').src = "#";
  document.getElementById('img-preview').style.display = 'none';
  await cargarServicios();
});

// ================== RENDERIZAR SERVICIOS ==================
function renderizarServicios() {
  const lista = document.getElementById('services');
  lista.innerHTML = "";

  servicios.forEach(serv => {
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

// ================== CALENDARIO ==================
function getNextDays(numDays) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

const days = getNextDays(5);
const startHour = 8;
const endHour = 18;
const calendar = document.getElementById("calendar");
const match = window.location.pathname.match(/\/servicio\/(\d+)/);
const servicio_id = match ? parseInt(match[1]) : null;

async function obtenerReservas() {
  const res = await fetch(`/api/reservas/${servicio_id}`);
  return res.ok ? await res.json() : [];
}

// Crear calendario básico
days.forEach(day => {
  const column = document.createElement("div");
  column.className = "day-column";

  const title = document.createElement("div");
  title.className = "day-title";
  title.textContent = day;
  column.appendChild(title);

  for (let hour = startHour; hour <= endHour; hour++) {
    const block = document.createElement("div");
    block.className = "hour-block";
    block.dataset.day = day;
    block.dataset.hour = hour.toString().padStart(2, '0');
    block.textContent = `${hour.toString().padStart(2, '0')}:00`;
    column.appendChild(block);
  }

  calendar.appendChild(column);
});

async function marcarReservasEnCalendario() {
  const reservas = await obtenerReservas();
  const usuarioActual = window.usuarioActual || null;
  const creadorServicio = window.creadorServicio || null;

  // Si el usuario es el creador, bloquea la selección
  if (usuarioActual === creadorServicio) {
    document.querySelectorAll('.hour-block').forEach(block => {
      block.style.pointerEvents = 'none';
      block.style.opacity = '0.5';
      block.title = 'No puedes reservar tu propio servicio';
    });
  } else {
    // Marcar reservas y permitir selección solo si no está ocupado
    reservas.forEach(reserva => {
      const block = Array.from(document.querySelectorAll('.hour-block')).find(b =>
        b.dataset.day === reserva.fecha && b.dataset.hour === reserva.hora
      );
      if (block) {
        block.classList.add("reserved");
        block.style.background = "#d63f3f";
        block.style.color = "#fff";
        block.title = "Reservado";
      }
    });

    // Permitir seleccionar bloques si no están reservados
    document.querySelectorAll(".hour-block:not(.reserved)").forEach(block => {
      block.addEventListener("click", () => {
        block.classList.toggle("selected");
      });
    });

    // Enviar selección
    document.getElementById("submit-button").addEventListener("click", () => {
      const selectedBlocks = document.querySelectorAll(".hour-block.selected");
      const horarios = [];

      selectedBlocks.forEach(block => {
        horarios.push({
          fecha: block.dataset.day,
          hora: block.dataset.hour
        });
      });

      if (horarios.length === 0) {
        alert("Selecciona al menos un horario antes de enviar.");
        return;
      }

      fetch("/api/horarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ horarios, servicio_id })
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          alert("¡Horarios guardados correctamente!");
          location.reload(); // recargar para ver marcado
        })
        .catch(() => {
          alert("Hubo un problema al enviar los horarios.");
        });
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  cargarServicios();
  marcarReservasEnCalendario();
});
