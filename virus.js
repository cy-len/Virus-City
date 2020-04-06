function daysToTicks(d)
{
    return d * globalClock.tickPerHours * 24;
}

const template = new DiseaseTemplate("The Virus", {
    incubationDuration: (age) => {
        return daysToTicks(4);
    },
    infectionDuration: (age) => {
        return daysToTicks(7 * age / 10);
    },
    immunityDuration: (age) => {
        return daysToTicks(7);
    },
    transmissionProb: (age) => {
        return 0.1;
    },
    transmissionDistance: (age) => {
        return null; // UNUSED for now
    },
    healthDropIncubation: (age) => { // per hour
        return age / 200;
    },
    healthDropInfection: (age) => { // per hour
        return age / 50;
    }
});
