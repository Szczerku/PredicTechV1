const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sensorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    addresIp: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    connected: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Sensor', sensorSchema);