const daysOfWeek = [
    'poniedziałek',
    'wtorek',
    'środa',
    'czwartek',
    'piątek',
    'sobota',
    'niedziela'
]

export const formatMessage = (currentTimetable, earliestTime) => {
    let availableSlots = {};
    Object.keys(currentTimetable).forEach(key => {
        const desiredTimeSlots = currentTimetable[key].filter(slot => slot.minutes >= earliestTime);
        if (desiredTimeSlots.length > 0) {
            availableSlots[key] = desiredTimeSlots;
        }
    });

    let availableSlotsString = '';

    if (Object.keys(availableSlots).length > 0) {
        Object.keys(availableSlots).forEach(key => {
            const weekday = (new Date(Date.parse(key))).getDay();
            availableSlotsString += `\n## 🏸 ${key} (${daysOfWeek[weekday - 1]})`
            availableSlots[key].forEach(slot => {
                availableSlotsString += `
                - ${slot.courts} kort(y) o ${slot.time}
                `;
            })
        });
    } else {
        availableSlotsString += '⛔️ Brak wolnych terminów'
    }

    return `
    # Dostępne terminy:
${availableSlotsString}
    `;
}