let rightPanel = null;
let state = null;
let jobType = null;
let health = null;

window.addEventListener("load", () => {
    rightPanel = document.getElementById("right-panel");
    state = document.getElementById("blob-state");
    jobType = document.getElementById("job-type");
    health = document.getElementById("hp");
});

function openRightPanel(blob)
{
    state.innerText = blob.state.name;
    if (blob.job.tile)
    {
        jobType.innerText = blob.job.tile.type;
    }
    else
    {
        jobType.innerText = "no job";
    }
    health.innerText = blob.health + "/100 hp";

    rightPanel.classList.add("open");
}

function closeRightPanel()
{
    rightPanel.classList.remove("open");
}
