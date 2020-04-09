const chartCanvas = document.getElementById("infected-chart");
const chart = chartCanvas.getContext("2d");
var chartWidth	= chartCanvas.offsetWidth,
    chartHeight	= chartCanvas.offsetHeight;

chartCanvas.width  = chartWidth  * window.devicePixelRatio;
chartCanvas.height = chartHeight * window.devicePixelRatio;
chartCanvas.style.width  = chartWidth  + "px";
chartCanvas.style.height = chartHeight + "px";

let infectedHistory = [];
let inHospitalHistory = [];
let deadHistory = [];
let succeptibleHistory = [];

function updateChart(infected, inHospital, dead, succeptible)
{
    infectedHistory.push(infected / originalPopulationSize);
    inHospitalHistory.push(inHospital / originalPopulationSize);
    deadHistory.push(dead / originalPopulationSize);
    succeptibleHistory.push(succeptible / originalPopulationSize);

    chart.clearRect(0, 0, chartWidth, chartHeight);

    const pixelsPerPoint = chartWidth / (infectedHistory.length - 1);

    chart.strokeWeight = 2;

    chart.textAlign = "right";
    
    chart.beginPath();
    chart.strokeStyle = "orange";
    chart.moveTo(0, chartHeight - infectedHistory[0] * chartHeight);
    for (let i = 1; i < infectedHistory.length; i++)
    {
        chart.lineTo(i * pixelsPerPoint, chartHeight - infectedHistory[i] * chartHeight);
    }
    chart.stroke();
    chart.fillText(infected, chartWidth - 10, chartHeight - infectedHistory[infectedHistory.length - 1] * chartHeight);
    
    chart.beginPath();
    chart.strokeStyle = "red";
    chart.moveTo(0, chartHeight - inHospitalHistory[0] * chartHeight);
    for (let i = 1; i < inHospitalHistory.length; i++)
    {
        chart.lineTo(i * pixelsPerPoint, chartHeight - inHospitalHistory[i] * chartHeight);
    }
    chart.stroke();
    chart.fillText(inHospital, chartWidth - 10, chartHeight - inHospitalHistory[inHospitalHistory.length - 1] * chartHeight);
    
    chart.beginPath();
    chart.strokeStyle = "black";
    chart.moveTo(0, chartHeight - deadHistory[0] * chartHeight);
    for (let i = 1; i < deadHistory.length; i++)
    {
        chart.lineTo(i * pixelsPerPoint, chartHeight - deadHistory[i] * chartHeight);
    }
    chart.stroke();
    chart.fillText(dead, chartWidth - 10, chartHeight - deadHistory[deadHistory.length - 1] * chartHeight);
    
    chart.beginPath();
    chart.strokeStyle = "green";
    chart.moveTo(0, chartHeight - succeptibleHistory[0] * chartHeight);
    for (let i = 1; i < succeptibleHistory.length; i++)
    {
        chart.lineTo(i * pixelsPerPoint, chartHeight - succeptibleHistory[i] * chartHeight);
    }
    chart.stroke();
    chart.fillText(succeptible, chartWidth - 10, chartHeight - succeptibleHistory[succeptibleHistory.length - 1] * chartHeight);

    if (infectedHistory.length > chartWidth)
    {
        infectedHistory.shift();
        inHospitalHistory.shift();
        deadHistory.shift();
        succeptibleHistory.shift();
    }
}