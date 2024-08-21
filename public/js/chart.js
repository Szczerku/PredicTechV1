$(document).ready(async function () {
    const MAX_DATA_COUNT = 25;
    const sensorColors = [
        "rgba(255, 0, 255, 0.5)", "rgb(255, 0, 255)",
        "rgba(0, 255, 0, 0.5)", "rgb(0, 255, 0)",
        "rgba(0, 0, 255, 0.5)", "rgb(0, 0, 255)",
        "rgba(255, 165, 0, 0.5)", "rgb(255, 165, 0)",
        "rgba(75, 122, 130, 0.5)", "rgb(75, 122, 130)",
        "rgba(255, 69, 0, 0.5)", "rgb(255, 69, 0)",
        "rgba(123, 104, 238, 0.5)", "rgb(123, 104, 238)",
        "rgba(255, 20, 147, 0.5)", "rgb(255, 20, 147)"
    ];

    function configureChart(ctx) {
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: []
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'white',
                            stepSize: 0.1
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    function addData(lineChart, label, data) {
        lineChart.data.labels.push(label);
        
        Object.keys(data).forEach((sensor, index) => {
            if (!lineChart.data.datasets.some(dataset => dataset.label === sensor)) {
                const colorIndex = index % sensorColors.length;
                lineChart.data.datasets.push({
                    label: sensor,
                    fill: true,
                    //backgroundColor: sensorColors[colorIndex * 2],
                    borderColor: sensorColors[colorIndex * 2 + 1],
                    lineTension: 0.33,
                    data: []
                });
            }
            
            const dataset = lineChart.data.datasets.find(dataset => dataset.label === sensor);
            dataset.data.push(data[sensor] ? data[sensor].toFixed(2) : null);
        });
        
        lineChart.update();
    }

    function removeFirstData(lineChart) {
        lineChart.data.labels.splice(0, 1);
        lineChart.data.datasets.forEach((dataset) => {
            dataset.data.shift();
        });
        lineChart.update();
    }

    function handleSocketData(lineChart, msg) {
        console.log(`Otrzymano dane z czujnika :: ${msg.date} :: ${JSON.stringify(msg.values)}`);

        if (lineChart.data.labels.length > MAX_DATA_COUNT) {
            removeFirstData(lineChart);
        }
        addData(lineChart, msg.date, msg.values);

        while (lineChart.data.labels.length > MAX_DATA_COUNT) {
            removeFirstData(lineChart);
        }
    }

    const ctx1 = document.getElementById("lineChart1").getContext("2d");
    const lineChart1 = configureChart(ctx1);

    const ws = new WebSocket('http://localhost:3000/ws'); 
    
    ws.onopen = () => {
        console.log('Connected TO WS SERVER');
    };
    
    ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
        const data = JSON.parse(event.data.trim());
        if (data.type === 'mqttStatus') {
            console.log('MQTT Status:', data.status);
            document.getElementById('mqttStatus').textContent = data.status;
        }
        console.log('Message from server:', data);
        
        const values = {};
        Object.keys(data).forEach(key => {
            if (key.startsWith("Sensor")) {
                values[key] = data[key];
            }
        });

        var exampleMsg = {
            date: new Date().toLocaleTimeString(),
            values: values
        };

        handleSocketData(lineChart1, exampleMsg);
    };

    ws.onclose = () => {
        console.log('Disconnected from WS SERVER');
    };
});
