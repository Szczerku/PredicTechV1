const Sensor = require('../models/sensor');

const saveSession = (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).send('Error saving session');
        }
        next();
    });
};

module.exports = async (req, res, next) => {
    console.log('Middleware OPENED');
    const sensorID = req.params.sensorId;
    
    try {
        const sensor = await Sensor.findById(sensorID);
        if (!sensor) {
            throw new Error('Sensor not found in database/getConnect.');
        }

        if (sensor.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Unauthorized');
        }

        const { addresIp, port, name } = sensor;
        const topic = name;

        const options = {
            host: addresIp,
            port: port,
            protocol: 'mqtts',
            username: 'Yousef',
            password: 'Yousef123'
        };
        if (req.session.clientOptions && JSON.stringify(req.session.clientOptions) === JSON.stringify(options)) {
            if (req.session.subTopic === topic) {
                console.log('Same options mqqt as recently - MIDDLWARE');
                return next();
            } else {
                console.log('Same client New topic in mqtt - MIDDLWARE');
                req.session.subTopic = topic;
                saveSession(req, res, next);
            }
        } else {
            console.log('New mqtt options - MIDDLWARE');
            req.session.clientOptions = options;
            req.session.subTopic = topic;
            saveSession(req, res, next);
        }
    } catch (err) {
        console.error('Error fetching sensor:', err);
        return res.status(500).send('Error fetching sensor');
    }
};
