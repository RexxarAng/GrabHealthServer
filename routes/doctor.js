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
const patient = require('../models/patient');




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
    Visit.findOne({ 'patient': '5c39d16a6debdf11bcf59be1'}, (err, reasonForVisit) =>  { // hard coded patient here 
    if (err) {
        console.log(err);
    }
    if (reasonForVisit) {
        console.log(reasonForVisit);
        res.send({ success: true, 'Visit': reasonForVisit }).status(201);
    }
    })

});

router.post('/add/reasonForVisit', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
        let reasonForVisit = new Visit({
            reasonForVisit: req.body.reasonForVisit
        })
        console.log();
    patient.find({ '_id': '5c39d16a6debdf11bcf59be1'}, (err,patientd) =>{ // hard coded patient here 
            if (err)
                console.log(error);
            if (patient) {
                console.log(patientd);
                patientd._id = '5c39d16a6debdf11bcf59be1';// hard coded patient here 
                console.log(patientd._id);
                console.log(req.body.reasonForVisit);
                Visit.create({ patient: patientd._id, reasonForVisit: req.body.reasonForVisit }, (err, patientd) => { // hard coded patient here 
                    if (err)
                        console.log(error);
                    else{
                        console.log ("Success");
                        console.log(patientd);
                    }
                });
                // Visit.patient.push(patientd._id);
                // Visit.reasonForVisit.push(req.body.reasonForVisit);
                // // Visit.save();
                // Visit.save(function (err) {
                //     if (err)
                //         res.send(err);
                //     res.json({ message: "Ok" });
                // });
            }
        });
            
          return res.json({ success: true, msg: "Reason for Visit successfully added" })
        

        })


module.exports = router;

