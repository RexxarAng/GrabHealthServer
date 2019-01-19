const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const multer = require('multer'); 
var DIR = './uploads';
var upload = multer({ dest: DIR }).single('photo');
//var watermark = require('image-watermark');
var watertext = require('watertext'); 
const MedicineList = require('../models/medicinelist');


isDoctor = function(req, res, next){
    if(req.user.role == 'Doctor') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}

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

           //watermark.embedWatermark(fpath, { 'text': 'sample watermark' });

            path = req.file.path;
           // watertext(path, { text: 'Awesome cat' })
               // .then(function (url) { path = url; });
          //  console.log("Watermarked!~~~")
            // console.log("file path" + fpath.extname(path));
            return res.send("Upload Completed");
        });
    })

router.get('/medicineList', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    MedicineList.findOne({ clinic: req.user.clinic })
        .populate({ path: 'list', select: 'name category price effects' })
        .exec(function (err, medicineList) {
            res.send({ 'medicineList': medicineList }).status(201);
        })
});

router.get('/next-patient', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    MedicineList.findOne({ clinic: req.user.clinic })
        .populate({ path: 'list', select: 'name category price effects' })
        .exec(function (err, medicineList) {
            console.log("HERE:");
            console.log({clinic: req.user.clinic});
            res.send({ 'medicineList': medicineList }).status(201);
        })
});


module.exports = router;

