const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const startHour = 8;
const endHour = 18;
const calendar = document.getElementById("calendar");

// Crear columnas por día
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
            block.classList.toggle("selected");
        });

        column.appendChild(block);
    }

    calendar.appendChild(column);
});

// Botón para enviar datos
const submitButton = document.getElementById("submit-button");
submitButton.addEventListener("click", () => {
    const selectedBlocks = document.querySelectorAll(".hour-block.selected");
    const horarios = [];

    selectedBlocks.forEach(block => {
        horarios.push({
            dia: block.dataset.day,
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
        body: JSON.stringify({ horarios: horarios })
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
