const mqtt = require('mqtt');

class MqttService {
    constructor() {
        this.client = null;
        this.options = null;
        this.topic = null;
        this.status = 'disconnected';
    }

    connect(options, topic, onMessage) {
        if (this.client && JSON.stringify(this.options) === JSON.stringify(options)) {
            // Jeśli klient istnieje i opcje się nie zmieniły, nie łączymy się ponownie
            return;
        }

        if (this.client) {
            this.client.end();
        }

        this.client = mqtt.connect(options);
        this.options = options;
        this.topic = topic;

        this.client.on('connect', () => {
            console.log('Połączono z brokerem MQTT');
            this.status = 'connected';
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Błąd subskrypcji tematu:', err);
                } else {
                    console.log('Subskrybowano temat:', topic);
                }
            });
        });

        this.client.on('message', (msgTopic, message) => {
            if (msgTopic === topic) {
                onMessage(JSON.parse(message.toString()));
            }
        });

        this.client.on('error', (error) => {
            console.error('Błąd:', error);
            this.status = 'error';
        });

        this.client.on('offline', () => {
            console.log('Klient MQTT offline');
            this.status = 'offline';
        });

        this.client.on('reconnect', () => {
            console.log('Ponowne łączenie z brokerem MQTT');
            this.status = 'reconnecting';
        });

        this.client.on('disconnect', () => {
            console.log('Odłączono od brokera MQTT');
            this.status = 'disconnected';
        });
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.options = null;
            this.topic = null;
            this.status = 'disconnected';
        }
    }

    getStatus() {
        return this.status;
    }
}

module.exports = MqttService;
