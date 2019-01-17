const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const Payment = require('../models/payment');
const Patient = require('../models/patient');
const Validator = require('../validation/validation');
const axios = require('axios');

isReceptionist = function(req, res, next){
    if(req.user.role == 'Receptionist') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}

//create patient
/*router.post('/createPatient', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    console.log(req.body);
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success:false, msg: "Invalid IC number!"});
    };
    
    if(!Validator.validateFirstName(req.body.firstName)){
        return res.json({success: false, msg: "Invalid first name!"});
    };

    if(!Validator.validateLastName(req.body.lastName)){
        return res.json({success: false, msg: "Invalid last name!"});
    };

    if(!Validator.validateGender(req.body.gender)){
        return res.json({success: false, msg: "Gender not selected!"});
    };

    if(!Validator.validateAddress(req.body.address)){
        return res.json({success: false, msg: "Invalid address!"});
    };

    if(!Validator.validateDOB(req.body.dob)){
        return res.json({success: false, msg: "Invalid DOB!"});
    };

    if(!Validator.validateNationality(req.body.nationality)) {
        return res.json({success: false, msg: "Invalid nationality!"});
    };

    if(!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({success: false, msg: "Invalid contact no.!"});
    };


    let newPatient = new Patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        password: req.body.password,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender
    });

    Patient.addUser(newPatient, (err, patient) => {
        if(err){
            console.log(err);
            res.json({success: false, msg: err});
        }
        if(patient){
            patient.clinic.push(req.user.clinic);
            patient.save(function(err2, saveToDB){
                if(err2){
                    return res.json({success: false, msg: err2});
                } else {
                    axios.post('http://localhost:4000/GrabHealthWeb/registerWalkInPatient', {                       
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        nric: req.body.nric,
                        contactNo: req.body.contactNo,
                        address: req.body.address,
                        dob: req.body.dob,
                        nationality: req.body.nationality,
                        gender: req.body.gender,
                        postalCode: req.body.postalCode,
                        attach: req.body.attach,
                        userName: req.body.userName,
                        password: req.body.password,
                        isWalkIn: req.body.isWalkIn
                    })
                    .then((res) => {
                        data = res['data'];
                        if(data['success']) {
                            return res.json({success: true, msg: data['msg']});
                        } else{
                            return res.json({success: false, msg: data['msg']});
                        }
                    })
                    .catch((error) => {
                        return res.json({success: false, msg: data['msg']});
                    });
                }
            });
            res.json({success: true, msg: 'Patient successfully created!'});
        }
    });
});*/

//create patient
router.post('/createPatient', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    console.log(req.body);
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success:false, msg: "Invalid IC number!"});
    };
    
    if(!Validator.validateFirstName(req.body.firstName)){
        return res.json({success: false, msg: "Invalid first name!"});
    };

    if(!Validator.validateLastName(req.body.lastName)){
        return res.json({success: false, msg: "Invalid last name!"});
    };

    if(!Validator.validateGender(req.body.gender)){
        return res.json({success: false, msg: "Gender not selected!"});
    };

    if(!Validator.validateAddress(req.body.address)){
        return res.json({success: false, msg: "Invalid address!"});
    };

    if(!Validator.validateDOB(req.body.dob)){
        return res.json({success: false, msg: "Invalid DOB!"});
    };

    if(!Validator.validateNationality(req.body.nationality)) {
        return res.json({success: false, msg: "Invalid nationality!"});
    };

    if(!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({success: false, msg: "Invalid contact no.!"});
    };


    let newPatient = new Patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        password: req.body.password,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender
    });

    axios.post('http://localhost:4000/GrabHealthWeb/registerWalkInPatient', {                       
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        attach: req.body.attach,
        isWalkIn: req.body.isWalkIn
    })
    .then((res1) => {
        data = res1['data'];
        if(data['success']) {
            Patient.addUser(newPatient, (err, patient) => {
                if(err){
                    console.log(err);
                    return res.json({success: false, msg: "Patient already exists"});
                }
                if(patient){
                    patient.clinic.push(req.user.clinic);
                    patient.save(function(err2, saveToDB){
                        if(err2){
                            return res.json({success: false, msg: err2});
                        } else {
                            if(saveToDB)
                                return res.json({success: true, msg: 'Patient successfully created!'});
                            else 
                                return res.json({success: false, msg: 'Patient cannot be created!'});
                        }
                    });          
                } else {
                    return res.json({success: false, msg: 'Patient cannot be created!'});
                }
            });
        } else{
            return res.json({success: false, msg: 'Patient cannot be created!'});
        }
    })
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });

});


//create payment
router.post('/createPayment', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    if(!Validator.validateNric(req.body.patient)){
        return res.json({success:false, msg: "Invalid IC number!"});
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



// Display patient list
router.get("/patient-list", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    Patient.find({"clinic": req.user.clinic}).sort({"firstName":1}).limit().exec(function(err,patients) {
        if(err)
            res.send({success: false, msg: err}).status(404);
        if(patients)
            res.send({success: true, 'patients': patients}).status(201);
        else
            res.send({success: false, msg: 'Something happened'}).status(404);
    });
});


router.post('/addPatientToQueue', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    req.body.clinc = req.user._id;
    axios.post('http://localhost:4000/GrabHealthWeb/addPatientToQueue', req.body)
    .then((res) => {
        data = res['data'];
        if(data['success']){
            return res.json({success: true, msg: 'Patient added to queue'});
        } else {
            return res.json({success: false, msg: 'Patient cannot added to queue'});
        }
    })
    .catch((error) => {
        return res.json({success: false, msg: 'Something happened connecting to localhost:4000'});
    });
  
});

module.exports = router;