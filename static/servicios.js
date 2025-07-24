const reserva = document.querySelector("#reserva");

// Para obtener las reservas del usuario (actualmente no uso la funcion)
async function obtenerReservas() {
  const res = await fetch("/api/reservas");
  if (res.ok) {
    const reservas = await res.json();
    return reservas;
  } else {
    return [];
  }
}

reserva.addEventListener("submit", async function(e) {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!fecha || !hora) {
    alert("Completa ambos campos antes de reservar.");
    return;
  }

  // Obtén el id del servicio desde la URL
  const match = window.location.pathname.match(/\/servicio\/(\d+)/);
  const servicio_id = match ? parseInt(match[1]) : null;

  if (!servicio_id) {
    alert("No se pudo identificar el servicio.");
    return;
  }

  const res = await fetch("/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ servicio_id, fecha, hora })
  });

  if (res.ok) {
    alert("Reserva realizada con éxito.");
    reserva.reset();
  } else {
    alert("Hubo un error al realizar la reserva.");
  }
});