const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const Payment = require('../models/payment');
const WalkInPatient = require('../models/walkinpatient');
const Validator = require('../validation/validation');
const axios = require('axios');
const Patient = require('../models/patient');


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

// Create patient
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

    if(!Validator.validateEmail(req.body.email)) {
        return res.json({success: false, msg: "Invalid email!"});
    }


    let newPatient = new WalkInPatient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        password: req.body.password,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        clinic: req.user.clinic,
        email: req.body.email
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
        email: req.body.email
    })
    .then((res1) => {
        data = res1['data'];
        if(data['success']) {
            WalkInPatient.addUser(newPatient, (err, patient) => {
                if(err){
                    console.log(err);
                    return res.json({success: false, msg: "Patient already exists"});
                }
                if(patient){
                    patient.clinic = req.user.clinic;
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
                    return res.json({success: false, msg: 'Walk-In Patient cannot be created!'});
                }
            });
        } else{
            return res.json({success: false, msg: data.errmsg});
        }
    })
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });

});


// Edit patient details
router.post('/editPatientInfo', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {    
    if(!Validator.validateFirstName(req.body.firstName)){
        return res.json({success: false, msg: "Invalid first name!"});
    };

    if(!Validator.validateLastName(req.body.lastName)){
        return res.json({success: false, msg: "Invalid last name!"});
    };

    if(!Validator.validateAddress(req.body.address)){
        return res.json({success: false, msg: "Invalid address!"});
    };

    if(!Validator.validateNationality(req.body.nationality)) {
        return res.json({success: false, msg: "Invalid nationality!"});
    };

    if(!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({success: false, msg: "Invalid contact no.!"});
    };
   
    if(!Validator.validateEmail(req.body.email)) {
        return res.json({success: false, msg: "Invalid email!"});
    };

    axios.post('http://localhost:4000/GrabHealthWeb/updateWalkInPatientDetails', {                       
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        email: req.body.email
    })
    .then((res1) => {
        data = res1['data'];
        if(data['success']) {
            WalkInPatient.findOne({nric: req.body.nric, clinic: req.user.clinic}, (err, patient) => {
                if(err){
                    res.json({success: false, msg: err});
                }
                if(patient){
                    patient.save(function(err2, changesMade){
                        if(err2){
                                return res.json({success: false, msg: err2});
                        } else {
                            if(changesMade){
                                patient.firstName = req.body.firstName;
                                patient.lastName = req.body.lastName;
                                patient.nric = req.body.nric;
                                patient.gender = req.body.gender;
                                patient.address = req.body.address;
                                patient.dob = req.body.dob;
                                patient.nationality = req.body.nationality;
                                patient.contactNo = req.body.contactNo;
                                patient.email = req.body.email;
                                patient.save();
                                return res.json({success: true, msg: "Patient details have been updated"});
                            } else 
                                return res.json({success: false, msg: "No changes have been made"});
                        }
                    });                   
                } else {
                    return res.json({success: false, msg: "Unable to save changes successfully"});
                }
            });
        } else{
            return res.json({success: false, msg: 'Patient details cannot be updated successfully!'});
        }
    })
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
    
});


// Display patient list
router.get("/patient-list", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    WalkInPatient.find({"clinic": req.user.clinic}).sort({"firstName":1}).limit().exec(function(err,patients) {
        if(err)
            res.send({success: false, msg: err}).status(404);
        if(patients)
            res.send({success: true, 'patients': patients}).status(201);
        else
            res.send({success: false, msg: 'Something happened'}).status(404);
    });
});


// Create payment
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



// Add patient to queue
router.post('/addPatientToQueue', [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    req.body.clinic = req.user.clinic;

    axios.post('http://localhost:4000/GrabHealthWeb/addPatientToQueue', {                       
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        email: req.body.email,
        clinic: req.user.clinic
    })
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
            Patient.findOne({nric: req.body.nric}, (err, patient) => {
                if(err){
                    console.log(err);
                    return res.json({success: false, msg: "Error"});
                }
                if(patient){
                    patient.clinic.push(req.user.clinic);
                    patient.save(function(err2, addToQueue){
                        if(err2){
                            return res.json({success: false, msg: err2});
                        } else {
                            if(addToQueue)
                                return res.json({success: true, msg: 'Patient successfully added to queue!'});
                            else 
                                return res.json({success: false, msg: 'Patient cannot be added to queue!'});
                        }
                    });          
                } else {
                    return res.json({success: false, msg: 'Patient cannot be added to queue!'});
                }
            });
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
  
});


// Display patients in queue <stopped here>
router.get("/queue-list", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    req.body.clinic = req.body.clinic;
    
    axios.get('http://localhost:4000/GrabHealthWeb/addPatientToQueue', {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        email: req.body.email,
        clinic: req.user.clinic,
        queueNo: req.body.queueNo
    }
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
            Patient.findOne({nric: req.body.nric})
            .populate({ select: 'firstName lastName nric email contactNo address dob nationality queueNo' })
            .exec(function (err, queueList) {
                res.send({ 'queueList': queueList }).status(201);
            })
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    })
    )

});


// Display patients in queue
/*router.get("/queue-list", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    Queue.find({"clinic": req.user.clinic}).sort({"firstName":1}).limit().exec(function(err,patients) {
        if(err)
            res.send({success: false, msg: err}).status(404);
        if(patients)
            res.send({success: true, 'patients': patients}).status(201);
        else
            res.send({success: false, msg: 'Something happened'}).status(404);
    });
});*/



// View pending approval list <use axios.get>


// Accept appointment request <use axios.post>


// Reject appointment request <use axios.post>

module.exports = router;