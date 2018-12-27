const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const multer = require('multer');

isDoctor = function(req, res, next){
    if(req.user.role == 'Doctor') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}
module.exports = router;


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg') 
    }
})
var photoUpload = multer({storage: storage}).single('photo')


// file uploading
    router.get('/', function (req, res, next) {
        // render the index page, and pass data to it.
        res.render('index', { title: 'Express' });
    });


    router.post('/registration', photoUpload, function (req, res, next) {
        var path = '';
        upload(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                console.log(err);
                return res.status(422).send("Error occurred")
            }
            // No error occured.

           // watermark.embedWatermark(path, { 'text': 'sample watermark' });

            path = req.file.path;
            // console.log("file path" + fpath.extname(path));
            return res.send("Upload Completed");
        });
    })


    module.exports = router;
isDoctor = function(req, res, next){
    if(req.user.role == 'Doctor') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}
module.exports = router;

