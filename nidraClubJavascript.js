async function loadYamlFile(filePath) {
    try {
        const response = await fetch(filePath);  // Fetch YAML file
        const yamlText = await response.text();  // Convert response to text
        return jsyaml.load(yamlText);            // Parse YAML to JSON object
    } catch (error) {
        console.error("Error loading YAML file:", error);
        return {};
    }
}

async function fetchDataAndProcess() {
    try {
        const [mappingYaml, jsonResponse] = await Promise.all([
            loadYamlFile("fields_mapping.yaml"),  // load YAML file
            fetch("nidraClub_updateData.json").then(res => res.json()) // Fetch JSON DATA
        ]);

        const fieldMappings = mappingYaml;  // Parsed YAML
        const nidraClubData = jsonResponse; // Backend JSON

        // Helper function to safely access fields dynamically
        function getValue(obj, path) {
            return path.split('.').reduce((acc, key) => (acc && acc[key] ? acc[key] : null), obj);
        }

        // Use mapping to access JSON fields dynamically
        processAndDrawChart(getValue(nidraClubData, fieldMappings.sleepAwakeDataset));

        //Sleep Stages Analysis Abhay
        processAndDrawChartSleepStagesAnalysis(getValue(nidraClubData, fieldMappings.sleepStagesDataset))
        processAndDrawDonutChart(getValue(nidraClubData, fieldMappings.sleepStagesDataset))

        drawHeartRateChart(
            getValue(nidraClubData, fieldMappings.heartRateDataset),
            getValue(nidraClubData, fieldMappings.lowerHeartPercentile),
            getValue(nidraClubData, fieldMappings.upperHeartPercentile)
        );

        drawBreathingRateChart(
            getValue(nidraClubData, fieldMappings.breathingRateDataset),
            getValue(nidraClubData, fieldMappings.lowerBreathingPercentile),
            getValue(nidraClubData, fieldMappings.upperBreathingPercentile)
        );

        drawRespiratoryEventsChart(getValue(nidraClubData, fieldMappings.irregularityIndex));

         const date = getValue(nidraClubData, fieldMappings.date);
         const sleepEfficiency   = getValue(nidraClubData, fieldMappings.sleepAggregationsEfficiency);
         const totalSleepTime   = getValue(nidraClubData, fieldMappings.sleepAggregationsTotalSleepTime);
         const sleepOnsetLatency   = getValue(nidraClubData, fieldMappings.sleepAggregationsSleepOnsetLatency);
         const wakeAfterSleepOnset   = getValue(nidraClubData, fieldMappings.sleepAggregationsWakeAfterSleepOnset);


         //Heart
       const lowerHeartPercentile = getValue(nidraClubData,
        fieldMappings.lowerHeartPercentile)
        const upperHeartPercentile = getValue(nidraClubData,
        fieldMappings.upperHeartPercentile)
        const medianHeartPercentile = getValue(nidraClubData,
        fieldMappings.medianHeartPercentile)

        //Breath

         const lowerBreathPercentile = getValue(nidraClubData,
        fieldMappings.lowerBreathingPercentile)
        const upperBreathPercentile = getValue(nidraClubData,
        fieldMappings.upperBreathingPercentile)
        const medianBreathPercentile = getValue(nidraClubData,
        fieldMappings.medianBreathingPercentile)

       
         // Populate tables dynamically
        populateRespiratoryTable(getValue(nidraClubData, fieldMappings.irregularityIndex), date);
        populateSessionTable(sleepEfficiency,totalSleepTime,sleepOnsetLatency,wakeAfterSleepOnset, date);
        populateSessionTable2(lowerHeartPercentile,
            medianHeartPercentile,upperHeartPercentile,date);
        populateSessionTable3(lowerBreathPercentile,
            medianBreathPercentile,upperBreathPercentile, date);

    } catch (error) {
        console.error("Error loading JSON data:", error);
    }
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", fetchDataAndProcess);







document.addEventListener("DOMContentLoaded", async () => {
    try {
       

//===========================================

        const response = await fetch("nidra_data.json");
        const jsonData = await response.json();
        // ✅ Populate User Information
        populateTable("userTable", jsonData.userInformation, false);
        
        // populate Device table
        populateTable("deviceTable", jsonData.deviceInformation, false);
         

       renderDoughnutChartTime("totalSleepChart", jsonData.sessionGraph[0].totalSleepTime, "Total Sleep Time");

       document.getElementById("sleepEfficiencyValue").textContent = jsonData.sessionGraph[0].sleepEfficiency + "%";

      
      
          // ✅ Render Actigram Chart
   

        // ✅ Render Three Doughnut Charts
        renderDoughnutChart("sleepScore", jsonData.nidraSummary.sleepScore);
        renderDoughnutChart("HeartScore", jsonData.nidraSummary.HeartScore);
        renderDoughnutChart("BreathingScore", jsonData.nidraSummary.BreathingScore);

   
        
                const studyDate = jsonData.DateOfStudy.studyDate;
    
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
});


function populateSessionTable(efficiency,totalSleepTimedate,
    sleepOnsetLatency,wakeAfterSleepOnset,date) {
    const tableBody = document.getElementById("sessionTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

   let row = `<tr>
        <td>${date}</td>
        <td>${totalSleepTimedate}</td>
        <td>${efficiency}</td>
        <td>${sleepOnsetLatency}</td>
        <td>${wakeAfterSleepOnset}</td>
    </tr>`;

    tableBody.innerHTML += row;
}

function populateSessionTable2(lowerPercentile,medianPercentile,upperPercentile,date) {
    const tableBody = document.getElementById("sessionTable2").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    
        let row = `<tr>
            <td>${date}</td>
            <td>${medianPercentile}</td>
            <td>${lowerPercentile}</td>
            <td>${upperPercentile}</td>
          
        </tr>`;
        tableBody.innerHTML += row;
    }


    

    


function populateSessionTable3(lowerPercentile,medianPercentile,upperPercentile,date) {
    const tableBody = document.getElementById("sessionTable3").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

  
        let row = `<tr>
            <td>${date}</td>
            <td>${medianPercentile}</td>
            <td>${lowerPercentile}</td>
            <td>${upperPercentile}</td>
          
        </tr>`;
        tableBody.innerHTML += row;
    }



// ✅ Function to Populate Tables (Optimized for All Tables)
function populateTable(tableId, data, highlightKeys = false) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.innerHTML = ""; // Clear existing content

    Object.entries(data).forEach(([key, value]) => {
        let row = `<tr>
                      <td style="${highlightKeys ? 'color: blue;' : ''}"><b>${key}</b></td>
                      <td>${value}</td>
                   </tr>`;
        table.innerHTML += row;
    });
}





// ✅ Function to Render Doughnut Chart with Centered Score
function renderDoughnutChart(canvasId, score) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Score", "Remaining"],
            datasets: [{
                data: [score, 10 - score],
                backgroundColor: ["blue", "lightgray"],
                borderColor: ["blue", "lightgray"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [{
            id: "centerText",
            beforeDraw: function (chart) {
                let width = chart.width,
                    height = chart.height,
                    ctx = chart.ctx;

                ctx.restore();
                let fontSize = (height / 6).toFixed(2);
                ctx.font = `${fontSize}px Arial`;
                ctx.textBaseline = "middle";

                let text = score.toFixed(1),
                    textX = Math.round((width - ctx.measureText(text).width) / 2),
                    textY = height / 2;

                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

// ✅ Render Sleep Actigram (Line Chart)
function renderLineChart(canvasId, dataset, label) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    // Create dataset with color based on sleep/awake status
    const dataValues = dataset.map(d => d.stage);
    const backgroundColors = dataset.map(d => (d.stage === 1 ? "gray" : "blue")); // Blue for sleep, Gray for awake

    new Chart(ctx, {
        type: "line",
        data: {
            labels: dataset.map(d => d.time),
            datasets: [{
                label: label,
                data: dataValues,
                borderColor: "blue",  // Line color
                borderWidth: 2,
                fill: true,
                backgroundColor: function(context) {
                    return backgroundColors[context.dataIndex]; // Set color dynamically
                },
                stepped: true // Ensure a step-like transition for sleep stages
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Time" }
                },
                y: {
                    title: { display: true, text: "Sleep Stage" },
                    min: 0,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? "s" : "Awake";
                        }
                    }
                }
            }
        }
    });
}

function renderDoughnutChartTime(canvasId, time, label) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    // ✅ Convert HH:MM format to minutes
    let sleepTime = parseFloat(time.split(":")[0]) * 60 + parseFloat(time.split(":")[1]);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [label, "Remaining Time"],
            datasets: [{
                data: [sleepTime, 480 - sleepTime],  // Assuming 8 hours (480 min) as full sleep
                backgroundColor: ["blue", "lightgray"],
                borderColor: ["blue", "lightgray"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// ✅ Function to Render Heart Rate Trend Graph
function renderHeartRateTrend(dataset, studyDate) {
    const ctx = document.getElementById("heartRateChart").getContext("2d");

    // Extract timestamps and heart rate values
  new Chart(ctx, {
        type: "line",
        data: {
            labels: dataset.map(d => d.timestamp),
            datasets: [{
                label: "Heart Rate (bpm)",
                data: dataset.map(d => d.heart_rate),
                borderColor: "red", // Line color
                backgroundColor: "rgba(255, 99, 132, 0.2)", // Light red fill
                borderWidth: 2,
                tension: 1.2, // ✅ Creates smooth ECG wave effect
                pointRadius: 3, // Small dots for key data points
                borderDash: [2, 2],
                pointBackgroundColor: "red"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Time Interval (s)" }
                },
                y: {
                    title: { display: true, text: "Heart Rate (bpm)" },
                    min: 50,
                    max: 100
                }
            }
        }
    });
}

function breathHeartRateTrend(data, studyDate) {
    const ctx = document.getElementById("breathRateChart").getContext("2d");

    // Extract timestamps and heart rate values
    const labels = data.map(entry => entry.timestamp);
    const dataValues = data.map(entry => entry.heart_rate);

    // Extract start and end time dynamically
    const startTime = labels[0];  // First timestamp in JSON
    const endTime = labels[labels.length - 1]; // Last timestamp in JSON

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "breath Rate (bpm)",
                data: dataValues,
                borderColor: "red",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: "red"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Breath Rate" },
                    ticks: {
                        callback: function(value, index, values) {
                            let timeLabel = labels[index]; // Time in HH:MM format
                            if (index === 0) return `${studyDate}\n${timeLabel}`;
                            if (index === values.length - 1) return `${studyDate}\n${timeLabel}`;
                            return timeLabel; // Show only time for other values
                        }
                    }
                },
                y: {
                    title: { display: true, text: "brpm" },
                    min: 50,
                    max: 100
                }
            }
        }
    });
}



function populateRespiratoryTable(data,date) {
    const tableBody = document.getElementById("respiratoryTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

 
     let row = `<tr>
            <td>${date}</td>
            <td>${data}</td>
          
          
        </tr>`;
        tableBody.innerHTML += row;
}


// ✅ Function to Render Corrected Respiratory Events Chart (Severity Bar)
// ✅ Function to Render Corrected Respiratory Events Chart (Severity Bar)
function renderRespiratoryGraph(data, severityData) {
    const ctx = document.getElementById("respiratoryChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(session => session.date),
            datasets: [{
                label: "Respiratory Events Per Hour",
                data: data.map(session => session.eventsPerHour),
                backgroundColor: "blue",
                borderColor: "blue",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "Session Date" }
                },
                y: {
                    title: { display: true, text: "Events per Hour" },
                    min: 0,
                    max: 45, // Maximum threshold from JSON
                    ticks: {
                        stepSize: 5,
                        callback: function(value) {
                            const index = severityData.severityThresholds.indexOf(value);
                            return index !== -1 ? severityData.severityLabels[index] : value;
                        }
                    }
                }
            }
        }
    });
}



//========================== Actual content

function processAndDrawChart(sleepAwakeDataset) {
        const dataSetLength = sleepAwakeDataset.dataSetLength;
        const dataSet = sleepAwakeDataset.dataSet;
         // Step size to pick 7 labels
    // const step = Math.floor(dataSetLength / 7);
    // const selectedData = [];

    //        for (let i = 0; i < 7; i++) {
    //     selectedData.push(dataSet[i * step]); // Extract timestamp & value
    // }


    
    const selectedData = [];

           for (let i = 0; i < dataSetLength; i++) {
        selectedData.push(dataSet[i]); // Extract timestamp & value
    }


    // Extract timestamps and values
    const xAxisLabels = selectedData.map(item => formatTimestamp(item[0]));
     const sleepData = selectedData.map(item => (item[1] === 1 ? 1 : 0)); // Sleep = 1, otherwise 0
    const awakeData = sleepData.map(value => 1 - value); // Opposite of sleep

    // Draw the chart
    drawChart(xAxisLabels, awakeData, sleepData);

}


function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
}


function drawChart(labels, awakeData, sleepData) {
    const ctx = document.getElementById('sleepChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // X-axis labels (Time)
            datasets: [
                {
                    label: 'Awake',
                    data: awakeData,
                    backgroundColor: 'rgba(221, 191, 255, 0.7)', // Light purple (Awake)
                    borderWidth: 0.0,
                    categoryPercentage: 1.0, // Full-width bars
                    barPercentage: 1.0
                },
                {
                    label: 'Sleep',
                    data: sleepData,
                    backgroundColor: 'rgba(98, 0, 125, 0.9)', // Dark purple (Sleep)
                    borderWidth: 0.0,
                    categoryPercentage: 1.0, // Full-width bars
                    barPercentage: 1.0
                }
            ]
        },
        options: {
            responsive: true,
            indexAxis: 'x', // Y-axis contains Awake/Sleep, X-axis contains Time
            scales: {
                x: {
                    stacked: true, // Stack Awake & Sleep horizontally
                    title: {
                        display: true,
                        text: 'Time' // X-axis title
                    },
                    ticks: {
                        autoSkip: true, // Reduce clutter
                        maxTicksLimit: 7, // Limit number of X-axis labels
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function(value, index, values) {
                            return labels[index]; // Show time labels
                        }
                    }
                },
                y: {
                    stacked: true, // Stack values on Y-axis
                    title: {
                        display: true,
                        text: '' // No title, just labels
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? "Awake" : "Sleep"; // Replace numbers with labels
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}


//====================================================Sleep Stages Analysis 

function processAndDrawChartSleepStagesAnalysis(sleepStagesData) {
    if (!sleepStagesData || sleepStagesData.length === 0) {
        console.error("No sleep stage data available.");
        return;
    }

    // Sleep stage mapping for better visualization
    const sleepStages = {
        0: "Invalid",
        1: "N3",
        2: "Deep",
        3: "Light",
        4: "REM",
        5: "Awake"
    };

   

   const dataSetLength = sleepStagesData.dataSetLength;
        const dataSet = sleepStagesData.dataSet;
         // Step size to pick 7 labels
    // const step = Math.floor(dataSetLength / 7);
    // const selectedData = [];

    //        for (let i = 0; i < 7; i++) {
    //     selectedData.push(dataSet[i * step]); // Extract timestamp & value
    // }


    
    const selectedData = [];

           for (let i = 0; i < dataSetLength; i++) {
        selectedData.push(dataSet[i]); // Extract timestamp & value
    }


    // Extract timestamps and sleep stage values
    const labels = selectedData.map(entry => formatTimestamp(entry[0]));
    const dataPoints = selectedData.map(entry => entry[1] !== null ? entry[1] : 0); // Default to Awake (0) if null

    // Destroy existing chart instance if it exists (prevents overlapping)
    if (window.hypnogramChartInstance) {
        window.hypnogramChartInstance.destroy();
    }

    // Create the hypnogram chart
    const ctx = document.getElementById("hypnogramChart").getContext("2d");
    window.hypnogramChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Sleep Stages",
                data: dataPoints,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                borderWidth: 2,
                pointRadius: 0,
                stepped: true // Creates a step-like hypnogram
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: {
                    title: { display: true, text: "Sleep Stage" },
                    ticks: {
                        callback: value => sleepStages[value] || "Unknown",
                        stepSize: 1,
                        max: 5,
                        min: 0
                    }
                }
            }
        }
    });
}




//===================================Donut chart

function processAndDrawDonutChart(sleepStagesData) {
    if (!sleepStagesData || !sleepStagesData.dataSet || sleepStagesData.dataSet.length === 0) {
        console.error("No sleep stage data available.");
        return;
    }

    const dataSet = sleepStagesData.dataSet;

    // Define sleep stage labels
    const sleepStages = {
        5: "Awake",
        4: "REM",
        3: "N1 (Light Sleep)",
        2: "N2",
        1: "N3 (Deep Sleep)",
        0: "Unknown"
    };

    // Count occurrences of each sleep stage
    const stageCounts = {};
    let totalStages = 0;

    dataSet.forEach(entry => {
        let stage = entry[1] !== null ? entry[1] : 5; // Default to "Unknown" if null
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        totalStages++;
    });

    // Convert counts to percentages and format labels
    const labels = Object.keys(stageCounts).map(stage => {
        const percentage = ((stageCounts[stage] / totalStages) * 100).toFixed(1); // Round to 1 decimal place
        return `${sleepStages[stage]} (${percentage}%)`; // Format label
    });

    const data = Object.values(stageCounts).map(count => (count / totalStages) * 100);

    // Colors for each stage

     
    const backgroundColors = ["rgba(148, 143, 222, 0.2)", "rgba(200, 177, 203, 0.2)", "rgba(54, 5, 86, 0.2)", "rgba(142, 176, 227, 0.2)", "rgba(14, 14, 241, 0.2)", "rgba(66, 6, 244, 0.32)"];

    // // Destroy existing chart if present
    // if (window.sleepStageDonutChart) {
    //     window.sleepStageDonutChart.destroy();
    // }

    // Create Donut Chart
    const ctx = document.getElementById("sleepStageDonutChart").getContext("2d");
    window.sleepStageDonutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels, // Labels with percentages
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom"
                }
            }
        }
    });
}


























//=============================================================































function handleNullHeartRate(dataset) {
    return dataset.map(([timestamp, value]) => [timestamp, value === null ? 0 : value]);
}

function drawHeartRateChart(heartRateDataset, lowerPercentile, upperPercentile) {
    const ctx = document.getElementById('heartRateChart').getContext('2d');

    let dataset = heartRateDataset.dataset;
    dataset = handleNullHeartRate(dataset); // Replace null values with 0

    const dataSetLength = dataset.length;
    const step = Math.max(1, Math.floor(dataSetLength / 100)); // Avoid zero step
    const selectedData = [];

    for (let i = 0; i < 100 && i * step < dataSetLength; i++) {
        selectedData.push(dataset[i * step]); // Pick every 'step' element
    }

    const xAxisLabels = selectedData.map(item => formatTimestamp(item[0]));
    const heartRates = selectedData.map(item => item[1]);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Heart Rate',
                data: selectedData.map((item, index) => ({
                    x: xAxisLabels[index],
                    y: item[1]
                })),
                backgroundColor: 'rgba(98, 0, 125, 0.9)', // Dark purple dots
                pointRadius: 2
            }, {
                label: 'Heart Rate Range',
                data: xAxisLabels.map(label => ({
                    x: label,
                    y: upperPercentile
                })),
                backgroundColor: 'rgba(221, 191, 255, 0.3)', // Light purple shaded area
                fill: true,
                pointRadius: 0
            }, {
                data: xAxisLabels.map(label => ({
                    x: label,
                    y: lowerPercentile
                })),
                backgroundColor: 'rgba(221, 191, 255, 0.3)', // Light purple bottom range
                fill: '-1',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7,
                        callback: function(value, index) {
                            return xAxisLabels[index];
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'bpm'
                    },
                    min: Math.min(...heartRates) - 5,
                    max: Math.max(...heartRates) + 5
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}




//========================================================Actual js code




function handleNullBreathingRate(dataset) {
    return dataset.map(([timestamp, value]) => [timestamp, value === null ? 0 : value]);
}

function drawBreathingRateChart(breathingRateDataset, lowerPercentile, upperPercentile) {
    const ctx = document.getElementById('breathRateChart').getContext('2d');

    let dataset = breathingRateDataset.dataset;
    dataset = handleNullBreathingRate(dataset); // Convert null values to 0

    const xAxisLabels = dataset.map(item => formatTimestamp(item[0]));
    const breathingRates = dataset.map(item => item[1]);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Breathing Rate',
                data: dataset.map((item, index) => ({
                    x: xAxisLabels[index],
                    y: item[1]
                })),
                backgroundColor: 'rgba(98, 0, 125, 0.9)',
                pointRadius: 1
            }, {
                label: 'Breathing Rate Range',
                data: xAxisLabels.map(label => ({
                    x: label,
                    y: upperPercentile
                })),
                backgroundColor: 'rgba(221, 191, 255, 0.3)',
                fill: true,
                pointRadius: 0
            }, {
                data: xAxisLabels.map(label => ({
                    x: label,
                    y: lowerPercentile
                })),
                backgroundColor: 'rgba(221, 191, 255, 0.3)',
                fill: '-1',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7,
                        callback: function(value, index) {
                            return xAxisLabels[index];
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'brpm'
                    },
                    min: Math.min(...breathingRates) - 5,
                    max: Math.max(...breathingRates) + 5
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}


// Load Chart.js
function drawRespiratoryEventsChart(eventsPerHour) {
   const ctx = document.getElementById('respiratoryChart').getContext('2d');

    const backgroundColors = ['#a7a7c7', '#f4c2c2', '#d391c4', '#b23a97'];
    const labels = ['Rarely', 'Mild', 'Moderate', 'Severe'];
    const dataValues = [5, 10, 15, 15]; // Width of each category

    const stackedData = dataValues.map((value, index) => ({
        label: labels[index],
        data: [value],
        backgroundColor: backgroundColors[index],
        barPercentage: 1.0,
        categoryPercentage: 1.0,
    }));

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [' '], // Single empty label for the stacked bar
            datasets: stackedData,
        },
        options: {
            indexAxis: 'y', // Ensures bars are horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }, // Disable tooltip if not needed
            },
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                    max: 45,
                    ticks: {
                        stepSize: 5, // Smaller steps for better visibility
                        callback: (value) => (value === 45 ? '45+' : value),
                    },
                    grid: { display: true },
                },
                y: {
                    stacked: true,
                    display: false, // Hide Y-axis
                },
            },
        },
        plugins: [{
            afterDraw: function (chartInstance) {
                const ctx = chartInstance.ctx;
                const xScale = chartInstance.scales.x;
                const chartArea = chartInstance.chartArea;

                if (!xScale) return;

                const markerX = xScale.getPixelForValue(eventsPerHour);
                const markerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2; // Center of bar

                // Draw circular marker
                ctx.fillStyle = '#6b0e69';
                ctx.beginPath();
                ctx.arc(markerX, markerY, 12, 0, Math.PI * 2);
                ctx.fill();

                // Add white text inside marker
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(eventsPerHour, markerX, markerY + 5);

                // Add section labels inside bars
                let cumulativeValue = 0;
                dataValues.forEach((value, index) => {
                    let startX = xScale.getPixelForValue(cumulativeValue);
                    let endX = xScale.getPixelForValue(cumulativeValue + value);
                    let centerX = (startX + endX) / 2; // Dynamically adjust position based on scale
                    
                    ctx.fillStyle = 'black';
                    ctx.font = '14px Arial'; // Adjust font size
                    ctx.textAlign = 'center';
                    ctx.fillText(labels[index], centerX, markerY + 30); // Adjust label position
                    cumulativeValue += value; // Update cumulative position
                });
            }
        }]
    });
}



