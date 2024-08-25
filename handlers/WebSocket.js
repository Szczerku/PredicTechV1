const WebSocket = require('ws');
const mqttService = require('../handlers/mqttService');

const wsmap = new Map();

function handleWebSocket(server, sessionParser) {
    const wss = new WebSocket.Server({clientTracking: false, noServer: true, path: '/ws'});
    console.log('WebSocket server created');
    server.on('upgrade', (req, socket, head) => {
        sessionParser(req, {}, () => {
            if (!req.session.user) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        });
    });

    // Handle WebSocket connections
    wss.on('connection', (ws, req) => {
        console.log('Client connected');

        const userIdExpected = req.session.user._id.toString();
        wsmap.set(userIdExpected, ws);
        console.log('Current user:', userIdExpected);
        // Handle WebSocket messages
        ws.on('message', (message) => {
            console.log('Received message from client:', message);
        });

        ws.on('close', () => {
            wsmap.delete(userIdExpected);
            console.log('Client disconnected');
        });

        ws.on('error', () => {
            wsmap.delete(userIdExpected);
            console.log('WebSocket error');
        });

        // Send initial MQTT status to the client
        //sendData(userIdExpected, { type: 'mqttStatus', status: mqttService.getStatus() });
    });
}

function sendData(userId, message) {
    if (wsmap.has(userId)) {
        wsmap.get(userId).send(JSON.stringify(message)); // Send message if user is connected
    } //else {
        //console.log('User not connected');
    //}
}

function sendMqttStatus(userId) {
    if (wsmap.has(userId)) {
        const statusMessage = {
            type: 'mqttStatus',
            status: mqttService.getStatus()
        };
        wsmap.get(userId).send(JSON.stringify(statusMessage));
    } else {
        console.log('User not connected');
    }
}

module.exports = {
    handleWebSocket: handleWebSocket,
    sendData: sendData,
    sendMqttStatus: sendMqttStatus
};
