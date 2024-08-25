const Sensor = require('../models/sensor');
const websocket = require('../handlers/WebSocket');
const mqttClientManager = require('../handlers/mqttClientManager');

exports.getConnect = async (req, res, next) => {
    try {
        const sensorID = req.params.sensorId;
        const sensor = await Sensor.findById(sensorID);
        if (!sensor) {
            throw new Error('Nie znaleziono czujnika w bazie danych/getConnect.');
        }
        if (sensor.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Brak autoryzacji');
        }

        const userId = sensor.userId.toString();
        const options = req.session.clientOptions;
        const topic = req.session.subTopic;

        mqttClientManager.removeClient(userId);
        console.log('Usunięto klienta MQTT');
        const client = mqttClientManager.getClient(userId, options);
        console.log('Pobrano klienta MQTT');

        // Subskrybowanie na temat i obsługa wiadomości
        client.on('connect', async () => {
            const currentSensor = await Sensor.findById(sensorID);
            if (!currentSensor.connected) {
                console.log('Połączono z brokerem MQTT');
                currentSensor.connected = true;
                await currentSensor.save();
            }
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Błąd podczas subskrybowania tematu: ${err}`);
                }
            });
        });

        client.on('message', (topic, message) => {
            websocket.sendData(userId, JSON.parse(message.toString()));
        });

        client.on('error', (err) => {
            console.error(`Błąd klienta MQTT: ${err}`);
        });

        client.on('close', async () => {
            const currentSensor = await Sensor.findById(sensorID);
            if (currentSensor.connected) {
                console.log('Zamknięto połączenie z brokerem MQTT');
                currentSensor.connected = false;
                await currentSensor.save();
            }
        });

        client.on('disconnect', async () => {
            console.log('Rozłączono z brokerem MQTT');
            sensor.connected = false;
            await sensor.save();
        });

        res.redirect('/ws');

    } catch (err) {
        console.error('Błąd:', err);
        const error = new Error(err.message || 'Wewnętrzny błąd serwera');
        error.httpStatusCode = err.status || 500;
        return next(error);
    }
};
