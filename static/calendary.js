// Script mejorado
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const startHour = 8;
const endHour = 18;
const calendar = document.getElementById("calendar");

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
        block.dataset.hour = hour;
        block.textContent = `${hour.toString().padStart(2, '0')}:00`;

        block.onclick = () => {
            block.classList.toggle("selected");
        };

        column.appendChild(block);
    }

    calendar.appendChild(column);
});

document.getElementById("submit-button").onclick = () => {
    const selectedBlocks = Array.from(document.querySelectorAll(".hour-block.selected"));
    const selectedData = selectedBlocks.map(block => ({
        day: block.dataset.day,
        hour: block.dataset.hour
    }));

    fetch("/api/horarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ horarios: selectedData })
    })
    .then(response => response.json())
    .then(data => {
        alert("¡Horario enviado correctamente!");
        console.log(data);
    })
    .catch(error => {
        alert("Error al enviar horarios");
        console.error(error);
    });
};
