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
const env_config = require('dotenv').config(); 
const Visit = require('../models/visit');
const password = require('secure-random-password');
const BlackList = require('../models/blacklist');

if(process.env.WEBSERVERURL){
    var webserverurl = process.env.WEBSERVERURL;
} else {
    var webserverurl =  'http://localhost:4000';
}


isReceptionist = function(req, res, next){
    if(req.user.role == 'Receptionist') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}

isNotBlackListedToken = function(req, res, next){
    BlackList.findOne({'token': req.headers.authorization}, (err, token) => {
        if(token){
            res.json({success: false, unauthenticated: true, msg: "Blacklisted token!"})
        } else {
            next();
        }
    });
}


router.post('/changePassword', [passport.authenticate('jwt', { session: false }), isReceptionist], (req, res, next) => {
    if(!validation.validate(req.body.newPassword)){
        return res.json({success: false, msg: "Please ensure password contains at least 8 characters including uppercase, lowercase, digits and no spaces "})
    }
    Receptionist.findOne({_id: req.user._id}, (err, receptionist) => {
        if(receptionist){
            Receptionist.comparePassword(req.body.currentPassword, receptionist.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch){
                    receptionist.password = req.body.newPassword;
                    Receptionist.addUser(receptionist, (err, updated) => {
                        if(err)
                            return res.json({success: false, msg: "Something happened"})
                        if(updated){
                            return res.json({success: true, msg: "Password successfully changed"})
                        } else {
                            return res.json({success: false, msg: "Password cannot be changed"})
                        }
                    });
                } else {
                    return res.json({success: false, msg: "Invalid current password entered"})
                }

            });
        } else {
            return res.json({success: false, msg: "Cannot find Manager"})
        }
    })
});
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
router.post('/createPatient', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
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


    let newPatient = new Patient({
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


    axios.post(webserverurl + '/GrabHealthWeb/registerWalkInPatient', {                       
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nric: req.body.nric,
        contactNo: req.body.contactNo,
        address: req.body.address,
        dob: req.body.dob,
        nationality: req.body.nationality,
        gender: req.body.gender,
        email: req.body.email,
        clinics: [req.user.clinic]
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
                    console.log(patient);
                    patient.clinic = req.user.clinic;
                    // patient.save(function(err2, saveToDB){
                    // if(err2){
                    //     return res.json({success: false, msg: err2});
                    // } else {
                    //     if(saveToDB)
                    //         return res.json({success: true, msg: 'Walk-In Patient successfully created!'});
                    //     else 
                    //         return res.json({success: false, msg: 'Walk-In Patient cannot be created!'});
                    // }
                    // }); 

                    WalkInPatient.findOne({patient: patient._id, clinic: req.user.clinic}, (err2, walkInPatient) => {
                        if(err2)
                            console.log(err2);
                        if(!walkInPatient){
                            let newWalkInPatient = new WalkInPatient({
                                patient: patient._id,
                                clinic: req.user.clinic
                            })
                            WalkInPatient.addUser(newWalkInPatient, (err3, savedWalkInPatient) =>{
                                if(err3)
                                    console.log(err3);
                                if(savedWalkInPatient){
                                    savedWalkInPatient.save();
                                    console.log(savedWalkInPatient);
                                    return res.json({success: true, msg: 'Walk-In Patient successfully created!'});
                                }
                                return res.json({success: false, msg: 'Walk-In Patient cannot be created!'});                                        
                            })
                        }
                    });
                } else {
                    return res.json({success: false, msg: 'Walk-In Patient cannot be created!'});
                }
            });
        } else{
            return res.json({success: false, msg: data});
        }
    })
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });

});


// Edit patient details
router.post('/editPatientInfo', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {    
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

    axios.post(webserverurl + '/GrabHealthWeb/updateWalkInPatientDetails', {                       
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
            Patient.findOne({nric: req.body.nric}, (err, patient) => {
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


// Display walk-in patient list
router.get("/patient-list", [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {

    WalkInPatient.find({ clinic: req.user.clinic })
        .populate({ path: 'patient', select: '-password', options: { sort: { 'firstName': -1 } } })
        .exec(function (err, patients) {
            console.log(patients);
            if(err)
                return res.send({success: false, msg: err}).status(404);
            console.log(patients);
            return res.send({success: true, 'patients': patients }).status(201);
        })
        
});


// Add patient to queue
router.post('/addPatientToQueue', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    console.log(req.body);
    req.body.clinic = req.user.clinic;

    axios.post(webserverurl + '/GrabHealthWeb/addPatientToQueue', {                       
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
            return res.json({success: true, msg: 'Walk-In Patient successfully added to queue!'});
        } else {
            return res.json({success: false, msg: 'Walk-In Patient cannot be added to queue!'});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
});


// Remove patient from queue
router.post('/removePatientFromQueue', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    console.log(req.body);
    axios.post(webserverurl + '/GrabHealthWeb/removePatientFromQueue', {
        nric: req.body.nric,
        clinic: req.user.clinic
    })
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
           return res.json({success: true, msg: data['msg']});
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
  
});


//Get queue list
router.get("/queueList", [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    console.log(req.body);
    axios.post(webserverurl + '/GrabHealthWeb/queueList',{
        clinic: req.user.clinic
    })
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
           return res.json({success: true, queueList: data['queueList']});
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    })
    
});


//Get pending approval list
router.get("/pendingList", [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    axios.post(webserverurl + '/GrabHealthWeb/pendingList',{
        clinic: req.user.clinic
    })
    .then((res1) => {
        data = res1['data'];
        if(data['success']) {
           return res.json({success: true, pendingList: data['pendingList']});
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    })
    
});


// Accept appointment request
router.post('/acceptAppointmentRequest', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    console.log(req.body);
    req.body.clinic = req.user.clinic;

    axios.post(webserverurl + '/GrabHealthWeb/acceptAppointmentRequest', {                       
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
        remarks: req.body.remarks
    })
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
            return res.json({success: true, msg: 'Patient successfully added to queue!'});
        } else {
            return res.json({success: false, msg: 'Patient has already been added to queue!'});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
});


// Reject appointment request
router.post('/rejectAppointmentRequest', [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    console.log(req.body);
    axios.post(webserverurl + '/GrabHealthWeb/rejectAppointmentRequest', {
        nric: req.body.nric,
        clinic: req.user.clinic
    })
    .then((res1) => {
        data = res1['data'];
        console.log(data);
        if(data['success']) {
            return res.json({success: true, msg: data['msg']});
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    });
    
});


// Display all patients in clinic
router.get("/all-patient-list", [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    axios.post(webserverurl + '/GrabHealthWeb/all-patient-list',{
        clinic: req.user.clinic,
        nric: req.body.nric
    })
    .then((res1) => {
        data = res1['data'];
        if(data['success']) {
           return res.json({success: true, patientRecords: data['patientRecords']});
        } else{
            return res.json({success: false, msg: data['msg']});
        }
    })                                                                                                                                                                                                                                                                           
    .catch((error) => {
        console.log(error);
        return res.json({success: false, msg: "Some error has occurred"});
    })
    
});

router.get("/visits", [passport.authenticate('jwt', {session:false}), isReceptionist, isNotBlackListedToken], (req, res) => {
    Visit.find({clinic: req.user.clinic, completed: false})
    .populate({path: 'patient', select: '-password' })
    .populate({path: 'medicineList'})
    .populate({path: 'clinic', select: '-receptionists -doctors -manager'})
    .populate({path: 'doctor', select: '-password'})
    .exec(function (err, visits) {
        if(err)
            return res.json({success: false, msg:err});
        console.log(visits);
        return res.json({success: true, visits: visits});
    });
});


// Create payment
router.post("/create/payment", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    console.log(req.body);
    Visit.findOne({clinic: req.user.clinic, patient: req.body.patient._id, completed: false})
    .populate({path: 'patient', select: '-password' })
    .populate({path: 'medicineList'})
    .populate({path: 'clinic', select: '-receptionists -doctors -manager'})
    .populate({path: 'doctor', select: '-password'})
    .exec(function (err, visit) {
        if(err)
            return res.json({success: false, msg:err});
        if(visit){
            Payment.findOne({visit: visit._id})
            .populate({path: 'patient', select: '-password' })
            .populate({path: 'visit', populate: 
                [
                    {
                        path: 'doctor',
                        model: 'Doctor',
                        select: '-password'
                },
                    {
                        path: 'medicineList',
                        model: 'Medicine'
                    }
                ]
            })
            .populate({path: 'clinic', select: '-receptionists -doctors -manager'})
            .exec(function (err2, paymentFound) {
                if(err2)
                    console.log(err2);
                if(paymentFound){
                    return res.json({success: true, payment: paymentFound});
                } else {
                    let subtotal = 0.0;
                    visit.medicineList.forEach(medicine => {
                        subtotal = subtotal + parseFloat(medicine.price.value);
                    });
                    subtotal = subtotal + visit.clinic.consultationFee;
                    gst = subtotal * 0.07;
                    total = subtotal + gst;
                    let randomReceiptNo = password.randomPassword({ length: 6, characters: password.digits });;
                    let year = "Y19 ";
                    var now = new Date();
                    var start = new Date(now.getFullYear(), 0, 0);
                    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
                    var oneDay = 1000 * 60 * 60 * 24;
                    var day = Math.floor(diff / oneDay);
                    receiptNo = year + day + randomReceiptNo;
                    let newPayment = new Payment({
                        receiptNo: receiptNo,
                        clinic: req.user.clinic,
                        patient: req.body.patient._id,
                        visit: visit._id,
                        gst: gst,
                        subtotal: subtotal,
                        total: total
                    });
                    newPayment.save(function(err, newPaymentSaved){
                        if(err)
                            res.json({success: false, msg: 'Something happened, Cannot create a new payment'});
                        if(newPaymentSaved){
                            axios.post(webserverurl + '/GrabHealthWeb/changeAppointmentStatus', {
                                nric: visit.patient.nric,
                                clinic: req.user.clinic,
                                status: 'Accepted',
                                date: newPaymentSaved.date,
                                billAmount: newPaymentSaved.total
                            })
                            .then((res1) => {
                                data = res1['data'];
                                console.log(data);
                                if(data['success']) {
                                    console.log("successfuly updated appointment status")
                                } else{
                                    console.log("failed to update appointment status");
                                }
                            })                                                                                                                                                                                                                                                                           
                            .catch((error) => {
                                console.log(error);
                            });
                            newPaymentSaved
                            .populate({path: 'patient', select: '-password' })
                            .populate({path: 'visit', populate: 
                                [
                                    {
                                        path: 'doctor',
                                        model: 'Doctor',
                                        select: '-password'
                                },
                                    {
                                        path: 'medicineList',
                                        model: 'Medicine'
                                    }
                                ]
                            })
                            .populate({path: 'clinic', select: '-receptionists -doctors -manager'})
                            .execPopulate(function (err, paymentRetrieved) {
                                if(err)
                                    res.json({success: false, msg: 'Cannot retrieve payment'});
                                if(paymentRetrieved){
                                    visit.completed = true
                                    visit.save();
                                    return res.json({success: true, payment: paymentRetrieved});
                                }
                            });
                            } else {
                                res.json({success: false, msg: 'Cannot create a new payment'});
                            }
                    });
                                
                }
            });

        } else {
            return res.json({success: false, msg: 'Visit does not exist'});
        }
    });
});


// Get visit history
router.post("/getVisit", [passport.authenticate('jwt', {session:false}), isReceptionist], (req, res) => {
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success: false, msg: 'Please enter a valid nric'});
    }
    Patient.findOne({nric: req.body.nric}, (err, patient) => {
        if(err)
            return res.json({success: false, msg: 'cannot retrieve patient'});
        if(patient){
            Payment.find({clinic: req.user.clinic, patient: patient._id })
            .populate({path: 'patient', select: '-password' })
            .populate({path: 'clinic', select: '-receptionists -doctors -manager'})
            .populate({path: 'visit', populate: 
            [
                {
                    path: 'doctor',
                    model: 'Doctor',
                    select: '-password'
            },
                {
                    path: 'medicineList',
                    model: 'Medicine'
                }
            ]
            })
            .exec(function (err, payments) {
                if(err) {
                    return res.json({success:false, msg:'Something happened'});
                }
                console.log(payments);
                return res.json({success: true, payments: payments});
            });
        } else {
            return res.json({success: false, msg: 'cannot retrieve patient'});
        }
    })
   
});



module.exports = router;