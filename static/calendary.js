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
        const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
        block.textContent = hourFormatted;

        // Activar selección visual
        block.onclick = () => {
            block.classList.toggle("selected");
        };

        column.appendChild(block);
    }

    calendar.appendChild(column);
});
