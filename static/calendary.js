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

const days = getNextDays(5); // 5 días desde hoy

const startHour = 8;
const endHour = 18;
const calendar = document.getElementById("calendar");
const match = window.location.pathname.match(/\/servicio\/(\d+)/);
const servicio_id = match ? parseInt(match[1]) : null;

async function obtenerReservas() {
  const res = await fetch(`/api/reservas/${servicio_id}`);
  if (res.ok) {
    const reservas = await res.json();
    return reservas;
  } else {
    return [];
  }
}

// Crear columnas por fecha
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

        block.addEventListener("click", () => {
            if (!block.classList.contains("reserved")) {
                block.classList.toggle("selected");
            }
        });

        column.appendChild(block);
    }

    calendar.appendChild(column);
});

// Marcar bloques reservados usando obtenerReservas
async function marcarReservasEnCalendario() {
    const reservas = await obtenerReservas();
    // Obtén tu usuario actual desde el backend (puedes pasar como variable global en el template)
    const usuarioActual = window.usuarioActual || null;

    reservas.forEach(reserva => {
        const block = Array.from(document.querySelectorAll('.hour-block')).find(b =>
            b.dataset.day === reserva.fecha && b.dataset.hour === reserva.hora
        );
        if (block) {
            block.classList.add("reserved");
            if (usuarioActual && reserva.usuario === usuarioActual) {
                block.classList.add("mine");
                block.style.background = "#3fd66b";
                block.style.color = "#161314";
                block.title = "Tu reserva (haz clic para eliminar)";
                block.addEventListener("click", async function () {
                    if (block.classList.contains("mine")) {
                        if (confirm("¿Eliminar esta reserva?")) {
                            await fetch(`/api/reservas/${reserva.id}`, { method: "DELETE" });
                            block.classList.remove("reserved", "mine");
                            block.style.background = "";
                            block.style.color = "";
                            block.title = "";
                        }
                    }
                });
            } else {
                block.style.background = "#d63f3f";
                block.style.color = "#fff";
                block.title = "Reservado";
            }
        }
    });
}

// Antes de llamar a marcarReservasEnCalendario, define window.usuarioActual en el template HTML:
// <script>window.usuarioActual = "{{ usuario }}";</script>

window.addEventListener("DOMContentLoaded", marcarReservasEnCalendario);

// Botón para enviar datos
const submitButton = document.getElementById("submit-button");
submitButton.addEventListener("click", () => {
    const selectedBlocks = document.querySelectorAll(".hour-block.selected");
    const horarios = [];

    selectedBlocks.forEach(block => {
        horarios.push({
            fecha: block.dataset.day,
            hora: block.dataset.hour
        });
    });

    // Verificar si hay selección
    if (horarios.length === 0) {
        alert("Selecciona al menos un horario antes de enviar.");
        return;
    }

    // Enviar al servidor
    fetch("/api/horarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ horarios: horarios, servicio_id: servicio_id })
    })
    .then(response => {
        if (!response.ok) throw new Error("Error en el servidor");
        return response.json();
    })
    .then(data => {
        console.log("Respuesta del servidor:", data);
        alert("¡Horarios guardados correctamente!");
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Hubo un problema al enviar los horarios.");
    });
});
