const mqtt = require('mqtt');

class MQTTClientManager {
    constructor() {
        this.clients = {};
    }

    getClient(userId, mqttOptions) {
        if(this.clients[userId]) {
            return this.clients[userId];
        } else {
            const client = mqtt.connect(mqttOptions);
            this.clients[userId] = client;
            return client;
        }
    }

    removeClient(userId) {
        if(this.clients[userId]) {
            this.clients[userId].end();
            delete this.clients[userId];
        }
    }

    removeAllClients() {
        Object.keys(this.clients).forEach((userId) => {
            this.clients[userId].end();
        });
        this.clients = {};
    }
}

module.exports = new MQTTClientManager();