const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user-controller');
const sendingData = require('../controllers/sending-data');
const isAuth = require('../middleware/is-auth');
const setSession = require('../middleware/is-connected');
const user = require('../models/user');

const router = express.Router();

router.get('/ws', isAuth, (req, res, next) => {
    res.render('user/dashboard', {
        pageTitle: 'WebSocket',
        path: '/ws'
    });
});

router.get('/', userController.getIndex);

router.get('/user/add-sensor',isAuth, userController.getAddSensor);

router.get('/user/sensors', isAuth, userController.getSensors);

router.post(
    '/user/add-sensor',
    [
        body('name')
            .isString()
            .isLength({ min: 3, max: 30 }) // Ustawienie maksymalnej długości na 30 znaków
            .trim(),
        body('addresIp')
            // .custom((value) => {
            //     // Sprawdzenie poprawności adresu IP
            //     const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
            //     if (!ipPattern.test(value)) {
            //         throw new Error('Invalid IP address format');
            //     }
            //     const parts = value.split('.');
            //     if (parts.some(part => parseInt(part, 10) > 255)) {
            //         throw new Error('Each octet of IP address should be between 0 and 255');
            //     }
            //     return true;
            // })
            .trim(),
        body('port')
            .isNumeric()
            .isLength({ min: 1 })
            .trim()
    ],
    isAuth, userController.postAddSensor
);

router.get('/user/edit-sensor/:sensorId', isAuth, userController.getEditSensor);

router.post(
    '/user/edit-sensor',
    [
        body('name')
            .isString()
            .isLength({ min: 3, max: 30 }) // Ustawienie maksymalnej długości na 30 znaków
            .trim(),
        body('addresIp')
        //     .custom((value) => {
        //         // Sprawdzenie poprawności adresu IP
        //         const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        //         if (!ipPattern.test(value)) {
        //             throw new Error('Invalid IP address format');
        //         }
        //         const parts = value.split('.');
        //         if (parts.some(part => parseInt(part, 10) > 255)) {
        //             throw new Error('Each octet of IP address should be between 0 and 255');
        //         }
        //         return true;
        //     })
        .trim(),
        body('port')
            .isNumeric()
            .isLength({ min: 1 })
            .trim()
    ],
    isAuth, userController.postEditSensor
);

router.post('/user/delete-sensor', isAuth, userController.postDeleteSensor);

router.get('/user/connect/:sensorId', isAuth, setSession, sendingData.getConnect);

router.get('/user/dashboard', isAuth, userController.getDashboard);

module.exports = router;