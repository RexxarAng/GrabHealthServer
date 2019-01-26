const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const Medicine = require("../models/medicine");
const passport = require('passport');
const multer = require('multer');
var DIR = './uploads';
var upload = multer({ dest: DIR }).single('photo');
//var watermark = require('image-watermark');
var watertext = require('watertext');
const MedicineList = require('../models/medicinelist');
const Visit = require('../models/visit');
const Patient = require('../models/patient');
const Validator = require('../validation/validation');
const WalkInPatient = require('../models/walkinpatient');
const axios = require('axios');
const env_config = require('dotenv').config();

if (process.env.WEBSERVERURL) {
    var webserverurl = process.env.WEBSERVERURL;
} else {
    var webserverurl = 'http://localhost:4000';
}
isDoctor = function (req, res, next) {
    if (req.user.role == 'Doctor') {
        next();
    } else {
        res.json({ success: false, unauthenticated: true, msg: "Permission denied!" })
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
var photoUpload = multer({ storage: storage }).single('photo')


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
    Visit.findOne({ patient: req.user.patient }, (err, reasonForVisit) => { 
        if (err) {
            console.log(err);
        }
        if (reasonForVisit) {
            console.log(reasonForVisit);
            res.send({ success: true, 'reasonForVisit': reasonForVisit }).status(201);
        }
    })

});

router.get('/instructions', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    Visit.findOne({ patient: req.user.patient }, (err, medicineInstructions) => { 
        if (err) {
            console.log(err);
        }
        if (medicineInstructions) {
            console.log(medicineInstructions);
            res.send({ success: true, 'medicineInstructions': medicineInstructions }).status(201);
        }
    })

});

router.post('/add/reasonForVisit', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    let reasonForVisit = new Visit({
        reasonForVisit: req.body.reasonForVisit
    })

    let medicineInstructions = new Medicine({

        medicineInstructions: req.body.medicineInstructions
    })
    console.log(req.body);

    Patient.findOne({ nric: req.body.nric }).sort({ "firstName": 1 }).limit().exec(function (err, patient) {
        if (err)
            console.log(error);
        if (patient) {
            console.log("Reason for visit enters: " + req.body.reasonForVisit);
            console.log("Medicine Instructions enter: " + req.body.medicineInstructions); 
            Visit.findOne({ patient: patient._id, completed: false, clinic: req.user._id }, (err2, visitFound) => {
                if (err2)
                    console.log(error);
                if (!visitFound) {
                    Visit.create({ patient: patient._id, reasonForVisit: req.body.reasonForVisit, queueNo: req.body.queueNo, clinic: req.user._id }, (err3, patientd) => { // hard coded patient here 
                        if (err3)
                            return res.json({ success: false, msg: err })
                        else {
                            console.log("visit created");
                            Medicine.find({ medicineInstructions: req.body.medicineInstructions }), (err4, medicineInstructions) => { 
                                if (err4) 
                                    console.log("error 4" + err4);
                                if (medicineInstructions) {
                                    visit.medicineList.push(medicine._id);
                                    console.log("Medicine instructions added here"); 
                                }
                            }
                            console.log("Success");
                            return res.json({ success: true, msg: "Patient's details successfully added" })

                        }
                    });
                } else {
                    visitFound.reasonForVisit = req.body.reasonForVisit;
                    visitFound.save(function (err4, visitSaved) {
                        if (err4)
                            console.log(err4)
                        if (visitSaved)
                            return res.json({ success: true, msg: "Visit successfully updated" })
                        else
                            return res.json({ success: false, msg: "Visit unable to be updated" })

                    })

                }
            });

        }
    });

})






// get walk-in patients 
router.get("/walkin-patientlist", [passport.authenticate('jwt', { session: false }), isDoctor], (req, res) => {
    WalkInPatient.find({ "clinic": req.user.clinic }).sort({ "firstName": 1 }).limit().exec(function (err, patients) {
        if (err)
            res.send({ success: false, msg: err }).status(404);
        if (patients)
            res.send({ success: true, 'patients': patients }).status(201);
        else
            res.send({ success: false, msg: 'Something happened' }).status(404);
    });
});

router.post('/editWalkInPatientInfo', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    WalkInPatient.findOne({ nric: req.body.nric }, (err, walkinpatient) => {
        if (err)
            res.json({ success: false, msg: err });
        if (walkinpatient) {
            walkinpatient.firstName = req.body.firstName;
            walkinpatient.lastName = req.body.lastName;
            walkinpatient.contactNo = req.body.contactNo;
            walkinpatient.address = req.body.address;
            walkinpatient.save();
            res.json({ success: true, msg: "Walk-in Patient details has been updated!" });
        }
    });
});


// get patients 
router.get("/patient-list", [passport.authenticate('jwt', { session: false }), isDoctor], (req, res) => {
    Patient.find({ "patient": req.user.patient }).sort({ "firstName": 1 }).limit().exec(function (err, patients) {
        if (err)
            res.send({ success: false, msg: err }).status(404);
        if (patients)
            res.send({ success: true, 'patients': patients }).status(201);
        else
            res.send({ success: false, msg: 'Something happened' }).status(404);
    });
});


router.post('/editPatientInfo', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    Patient.findOne({ nric: req.body.nric }, (err, patient) => {
        if (err)
            res.json({ success: false, msg: err });
        if (patient) {
            patient.firstName = req.body.firstName;
            patient.lastName = req.body.lastName;
            patient.contactNo = req.body.contactNo;
            patient.address = req.body.address;
            patient.save();
            res.json({ success: true, msg: "Patient details has been updated!" });
        }
    });
});

// get current patient 
router.get("/current-patient", [passport.authenticate('jwt', { session: false }), isDoctor], (req, res) => {
    axios.post(webserverurl + '/GrabHealthWeb/queueList', {
        clinic: req.user.clinic
    })
        .then((res1) => {
            data = res1['data'];
            console.log(data);
            console.log(data['queueList']['patients'][0]);
            if (data['success']) {
                return res.json({ success: true, queueList: data['queueList']['patients'][0] });
            } else {
                return res.json({ success: false, msg: data['msg'] });
            }
        })
        .catch((error) => {
            console.log(error);
            return res.json({ success: false, msg: "Some error has occurred" });
        })

});

router.post('/add/medicine', [passport.authenticate('jwt', { session: false }), isDoctor], (req, res, next) => {
    req.body.clinic = req.user.clinic;
    console.log(req.body);
    MedicineList.findOne({ clinic: req.user.clinic }, (err, selectedMedicineList) => {
        if (err)
            return res.json({ success: false, msg: 'Medicine list cannot be found' });
        if (selectedMedicineList) {
            Medicine.findOne({ clinic: req.user.clinic, name: req.body.name }, (err, medicine) => {
                if (err)
                    console.log(err);
                if (medicine) {
                    console.log ("inside medicine");
                    Visit.findOne({ queueNo: req.body.queueNo, completed: false }, (err3, visit) => {
                        console.log (visit);
                        if (err3)
                            return res.json({ success: false, msg: err3 });
                        if (visit) {
                            console.log("inside visit med");
                            visit.medicineList.push(medicine._id);
                            visit.save(function (err, visitSaved) {
                                if (err)
                                    return res.json({ success: false, msg: 'Visit cannot be updated' });
                                if (visitSaved) {
                                    return res.json({ success: true, msg: "Visit successfully updated for Patient" })
                                }
                                else
                                    return res.json({ success: false, msg: 'Visit cannot be updated' });
                            });
                        }
                        if (visit == null)
                        {
                            
                            console.log ("inside null");
                            Visit.create({queueNo: req.body.queueNo, clinic: req.user.clinic}, (err3, visit) => { // hard coded patient here 
                                if (err3)    
                                    return res.json({ success: false, msg: err })
                                else {
                                    console.log("visit created");
                                    
                                    visit.medicineList.push(medicine._id);
                                    console.log("Medicine instructions added here");
                                     
                                    console.log("Success");
                                    return res.json({ success: true, msg: "Patient's details successfully added" })

                                }
                            });
                        }
                    })
                } else {
                    // console.log(medicine);
                    return res.json({ success: false, msg: 'Medicine cannot be added' });
                }
            })
        }
    });
});
router.post("/create/visit", [passport.authenticate('jwt', { session: false }), isDoctor], (req, res) => {
    console.log(req.body);
    Patient.findOne({nric: req.body.patient.nric}, (findpatientErr, patient) => {
        if(findpatientErr)
            return res.json({success: false, msg: findpatientErr});
        if(patient){
            Visit.findOne({ patient: patient._id, completed: false, clinic: req.user.clinic }, (err2, visitFound) => {
                if (err2)
                console.log(error);
                if (!visitFound) {
                    medicineList = [];
                    for(var medicine in req.body.medicineList){
                        Medicine.findOne({name: medicine.name}, (err, medicine) => {
                            if(err)
                                console.log(err)
                            if(medicine)
                                medicineList.push(medicine._id);
                        });
                    }
                    let visit = new Visit({
                        clinic: req.user.clinic,
                        patient: patient._id,
                        medicineList: medicineList,
                        queueNo: req.body.queueNo,
                        reasonForVisit: req.body.reasonForVisit
                    });
                    Visit.create(visit, (err, visit) => {
                        if (err) {
                            return res.json({ success: false, msg: 'Please ensure that reason for visit is entered' });
                        }
                        if (visit) {
                            axios.post(webserverurl + '/GrabHealthWeb/removeFromQueue', {
                                nric: patient.nric,
                                clinic: req.user.clinic
                            })
                            .then((res1) => {
                                data = res1['data'];
                                if (data['success']) {
                                    return res.json({ success: true, msg: 'Visit successfully created' });
                                } else {
                                    return res.json({ success: false, msg: data['msg'] });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                return res.json({ success: false, msg: "Some error has occurred" });
                            })
        
                        }
                    })
                } else {
                    return res.json({ success: false, msg: "Visit already pending for payment" })
                }
            });
        } else {
            return res.json({ success: false, msg: "Patient doesn't exist"});
        }

    })
});

// get medicine 
router.get("/medicine", [passport.authenticate('jwt', { session: false }), isDoctor], (req, res) => {
    MedicineList.findOne({ clinic: req.user.clinic })
        .populate({ path: 'list', select: 'name category price effects' })
        .exec(function (err, selectedMedicineList) {
            res.send({ 'selectedMedicineList': selectedMedicineList }).status(201);
        })
});




module.exports = router;

