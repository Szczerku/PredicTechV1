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

        const client = mqttClientManager.getClient(userId, options);

        // Subskrybowanie na temat i obsługa wiadomości
        client.on('connect', () => {
            console.log('Połączono z brokerem MQTT');
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Błąd podczas subskrybowania tematu: ${err}`);
                }
            });
        });

        client.on('message', (topic, message) => {
            websocket.sendData(userId, JSON.parse(message.toString()));
        });
        // const mqttService = new MqttService();
        // mqttService.connect(options, topic, (message) => {
        //     websocket.sendData(userId, message);
        // });

        
        res.redirect('/ws');

    } catch (err) {
        console.error('Błąd:', err);
        const error = new Error(err.message || 'Wewnętrzny błąd serwera');
        error.httpStatusCode = err.status || 500;
        return next(error);
    }
};
