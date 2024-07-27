const { validationResult } = require('express-validator');
const Sensor = require('../models/sensor');
const mqttService = require('../handlers/mqttService');

//Start Page
exports.getIndex = (req, res, next) => {
    Sensor.find()
        .then(sensors => {
            res.render('user/index', {
                sens: sensors,
                pageTitle: 'Home',
                path: '/',
                
            });
        })
        .catch(err => {
            console.log(err);
        });
}
//Add Sensor
exports.getAddSensor = (req, res, next) => {
    res.render('user/edit-sensor', {
        pageTitle: 'Add Sensor',
        path: '/user/add-sensor',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddSensor = (req, res, next) => {
    const name = req.body.name;
    const addresIp = req.body.addresIp;
    const port = req.body.port;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('user/edit-sensor', {
            pageTitle: 'Add Sensor',
            path: '/user/add-sensor',
            editing: false,
            hasError: true,
            sensor: {
                name: name,
                addresIp: addresIp,
                port: port
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    const sensor = new Sensor(
        {
            name: name,
            addresIp: addresIp,
            port: port,
            userId: req.user,
            connected: false
        }
    );
    sensor
        .save()
        .then(result => {
            return req.user.addToCart(sensor._id);
        })
        .then(result => {
            console.log('Created Sensor');
            res.redirect('/user/sensors'); // TUTAJ POWINNO ISC DO STRONY Z SENSORAMI
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

//Edit Sensor
exports.getEditSensor = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const senId = req.params.sensorId;
    Sensor.findById(senId)
        .then(sensor => {
            if (!sensor) {
                return res.redirect('/');
            }
            res.render('user/edit-sensor', {
                pageTitle: 'Edit Sensor',
                path: '/user/edit-sensor',
                editing: editMode,
                sensor: sensor,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditSensor = (req, res, next) => {
    const senId = req.body.sensorId;
    const updatedName = req.body.name;
    const updatedAddresIp = req.body.addresIp;
    const updatedPort = req.body.port;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('user/edit-sensor', {
            pageTitle: 'Edit Sensor',
            path: '/user/edit-sensor',
            editing: true,
            hasError: true,
            sensor: {
                name: updatedName,
                addresIp: updatedAddresIp,
                port: updatedPort,
                _id: senId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    Sensor.findById(senId)
        .then(sensor => {
            if (sensor.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            sensor.name = updatedName;
            sensor.addresIp = updatedAddresIp;
            sensor.port = updatedPort;
            return sensor.save().then(result => {
                console.log('UPDATED SENSOR!');
                res.redirect('/user/sensors');
            });
        }) 
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getSensors = (req, res, next) => {
    Sensor.find({ userId: req.user._id}) // dla tego konkretnego usera pokazuje sensory
        .then(sensors => {
            res.render('user/sensors', {
                sens: sensors,
                pageTitle: 'User Sensors',
                path: '/user/sensors',
                session: req.session
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getGraphs = (req, res, next) => {
    Sensor.find({ userId: req.user._id})
    .then(sensors => {
        res.render('user/graphs', {
            sens: sensors,
            pageTitle: 'Graphs',
            path: '/user/graphs'
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//Delete Sensor
exports.postDeleteSensor = (req, res, next) => {
    const senId = req.body.sensorId;
    Sensor.findById(senId)
        .then(sensor => {
            if (!sensor) {
                return next(new Error('Sensor not found.'));
            }
            return Sensor.deleteOne({ _id: senId, userId: req.user._id });
        })
        .then(() => {
            console.log('DESTROYED SENSOR');
            res.redirect('/user/sensors');
            //res.status(200).json({ message: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting product failed.' });
        });
}

exports.getDashboard = (req, res, next) => {
    Sensor.find()
        .then(sensors => {
            const status = mqttService.getStatus();
            res.render('user/dashboard', {
                sens: sensors,
                status: status,
                pageTitle: 'Dashboard',
                path: '/user/dashboard',
                
            });
        })
        .catch(err => {
            console.log(err);
        });
}








