let infectRandom = document.getElementById("infect-random");

infectRandom.addEventListener("click", () => {
    let index = Math.floor(Math.random() * map.entities.length);
    let poorBlob = map.entities[index];

    poorBlob.getSick(template);
});

let infectedCountP = document.getElementById("infected-count");
let infectedCount = 0;
function incrementInfectedCount()
{
    infectedCount++;
    infectedCountP.innerText = "Infected count : " + infectedCount  + " (total population size : " + map.entities.length + ")";
}
function decrementInfectedCount()
{
    infectedCount--;
    infectedCountP.innerText = "Infected count : " + infectedCount  + " (total population size : " + map.entities.length + ")";
}

let inHospitalCountP = document.getElementById("in-hospital-count");
let inHospitalCount = 0;
function incrementInHospitalCount()
{
    inHospitalCount++;
    updateInHospitalCountP();
}
function decrementInHospitalCount()
{
    inHospitalCount--;
    updateInHospitalCountP();
}
function updateInHospitalCountP()
{
    let hospitals = map.buildings["hospital"];
    let totalCapacity = 0;
    hospitals.forEach((h) => {
        totalCapacity += h.capacity;
    });

    inHospitalCountP.innerText = "In hospital count : " + inHospitalCount + "/" + totalCapacity;
}

let deathsCountP = document.getElementById("deaths-count");
let deathsCount = 0;
function incrementDeathsCount()
{
    deathsCount++;
    deathsCountP.innerText = deathsCount + " deaths";
}

let curedCountP = document.getElementById("cured-count");
let curedCount = 0;
function incrementCuredCount()
{
    curedCount++;
    curedCountP.innerText = curedCount + " cured";
}

let introduceMedicineButton = document.getElementById("introduce-medicine");
introduceMedicineButton.addEventListener("click", () => {
    alert("Hospital efficiency has been doubled");
    hospitalEfficiency *= 2;
});