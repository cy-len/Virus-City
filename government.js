const allowedBuildings = {
    "hospital": true,
    "cinema": true,
    "food-shop": true,
    "goodies-shop": true,
    "office": true,
    "school": true
}

let hospitalEfficiency = 2; // Maximum hp gain per day at the hospital

let closeOfficesButton = document.getElementById("close-offices");
let closeSchoolsButton = document.getElementById("close-schools");
let closeCinemasButton = document.getElementById("close-cinemas");
let closeGoodiesShopsButton = document.getElementById("close-goodies-shops");

closeOfficesButton.addEventListener("click", () => {
    allowedBuildings.office = !allowedBuildings.office;
    if (allowedBuildings.office)
    {
        closeOfficesButton.innerText = "Close";
    }
    else
    {
        closeOfficesButton.innerText = "Re-open";
    }
});

closeSchoolsButton.addEventListener("click", () => {
    allowedBuildings.school = !allowedBuildings.school;
    if (allowedBuildings.school)
    {
        closeSchoolsButton.innerText = "Close";
    }
    else
    {
        closeSchoolsButton.innerText = "Re-open";
    }
});

closeCinemasButton.addEventListener("click", () => {
    allowedBuildings.cinema = !allowedBuildings.cinema;
    if (allowedBuildings.cinema)
    {
        closeCinemasButton.innerText = "Close";
    }
    else
    {
        closeCinemasButton.innerText = "Re-open";
    }
});

closeGoodiesShopsButton.addEventListener("click", () => {
    allowedBuildings["goodies-shop"] = !allowedBuildings["goodies-shop"];
    if (allowedBuildings["goodies-shop"])
    {
        closeGoodiesShopsButton.innerText = "Close";
    }
    else
    {
        closeGoodiesShopsButton.innerText = "Re-open";
    }
});

let forbidWalks = document.getElementById("forbid-walks");
let walksAllowed = true;

forbidWalks.addEventListener("click", () => {
    walksAllowed = !walksAllowed;

    if (walksAllowed)
    {
        forbidWalks.innerText = "Forbid walks";
    }
    else
    {
        forbidWalks.innerText = "Re-allow walks";
    }
});

let boostHospitals = document.getElementById("boost-hospitals");
let isBoosted = false;

boostHospitals.addEventListener("click", () => {
    isBoosted = !isBoosted;

    if (isBoosted)
    {
        boostHospitals.innerText = "Go back to normal capacity";
        map.buildings["hospital"].forEach((h) => {
            h.capacity *= 1.5;
        });
    }
    else
    {
        boostHospitals.innerText = "Hospitals capacity x1.5";
        map.buildings["hospital"].forEach((h) => {
            h.capacity /= 1.5;
        });
    }
    updateInHospitalCountP();
});

let protectDoctors = document.getElementById("protect-doctors");
let haveMask = false;

protectDoctors.addEventListener("click", () => {
    if (haveMask)
    {
        return;
    }
    map.entities.filter((b) => {
        return (b.job.tile && b.job.tile.type == "hospital");
    }).forEach((b) => {
        b.ownDefenses += 0.7;
    });
    haveMask = true;
});
