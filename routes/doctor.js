const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const dispensemedicine = require("../models/dispensemedicine");
const passport = require('passport');
const multer = require('multer'); 
var DIR = './uploads';
var upload = multer({ dest: DIR }).single('photo');
//var watermark = require('image-watermark');
var watertext = require('watertext'); 
const MedicineList = require('../models/medicinelist');
const Visit = require('../models/visit');



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

// router.get('/next-patient', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
//     MedicineList.findOne({ clinic: req.user.clinic })
//         .populate({ path: 'list', select: 'name category price effects' })
//         .exec(function (err, medicineList) {
//             console.log("HERE:");
//             console.log({clinic: req.user.clinic});
//             res.send({ 'medicineList': medicineList }).status(201);
//         })
// });

router.get('/reasonForVisit', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    Visit.findOne({ Visit: req.reasonForVisit }), (err, reasonForVisit) =>  {
    if (err)
        res.send({ success: false, msg: err }).status(404);
    if (reasonForVisit)
        res.send({ success: true, 'Visit': reasonForVisit }).status(201);
    else
        res.send({ success: false, msg: 'Something happened' }).status(404);
    }

});

router.post('/add/reasonForVisit', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
        console.log("here:" + req.body.reasonForVisit); 
        let reasonForVisit = new Visit({
            reasonForVisit: req.body.reasonForVisit
        })
        return res.json({ success: true, msg: "Reason for Visit successfully added" })


        })


module.exports = router;

