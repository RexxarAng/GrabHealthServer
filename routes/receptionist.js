const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const Payment = require('../models/payment');
const Patient = require('../models/patient');
const Validator = require('../validation/validation');

isReceptionist = function(req, res, next){
    if(req.user.role == 'Receptionist') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}

router.post('/createPatient', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    let newPatient = new Patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        password: req.body.password,
        contactNo: req.body.contactNo,
        address: req.body.address
    });

    Patient.addUser(newPatient, (err, patient) => {
        if(err){
            console.log(err);
            res.json({success: false, msg: err});
        }
        if(patient){
            patient.clinic.push(req.user.clinic);
            patient.save();
            res.json({success: true, msg: 'Patient successfully created!'});
        }
    });
});

router.post('/createPayment', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    if(!Validator.validateNric(req.body.patient)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    Patient.findOne({nric: req.body.patient}, (err, patient) => {
        if(err){
            res.json({success: false, msg:'Patient does not exist'});
        }
        if(patient){
            let newPayment = new Payment({
                clinic: req.user.clinic,
                receiptNo: req.body.payment.receiptNo,
                date: req.body.payment.date,
                receiptNo: req.body.receiptNo,
                patient: patient._id
            })
        }
    })
  
});

router.get("/patient-list", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    Patient.find({"clinic": req.user.clinic}).sort({"firstName":1}).limit().exec(function(err,patients) {
        if(err)
            res.send({success: false, msg: err}).status(404);
        if(patients)
            res.send({'patients': patients}).status(201);
    });
});

module.exports = router;