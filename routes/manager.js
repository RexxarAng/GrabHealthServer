const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const Validator = require('../validation/validation');
const password = require('secure-random-password');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
      user: 'grabhealthteam@gmail.com',
      pass: 'GrabHealth2018S2ABCE'
    },
    tls: {
        rejectUnauthorized: false
    }
  }));
  
var mailOptions = {
    from: 'grabhealthteam@gmail.com',
    to: 'Enter recipient email address',
    subject: 'Enter subject',
    text: 'Enter text'
};

isManager = function(req, res, next){
    if(req.user.role == 'Manager') {
        next();
    } else {
        res.json({success: false, unauthenticated: true, msg: "Permission denied!"})
    }
}

router.post('/register/receptionist', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => { 
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    if(!Validator.validateEmail(req.body.email)) {
        return res.json({success:false, msg: "invalid email format" })
    };
    req.body.email = req.body.email.toLocaleLowerCase();
    Manager.findOne({ email: req.user.email })
        .populate({path: 'clinic', select: '-clinicLicenseNo'})
        .exec(function(err, manager){
            if(err){
                return res.json({success: false, msg: err});
            } else {
                var randomPassword = password.randomPassword({ characters: password.lower + password.upper + password.digits });
                let newReceptionist = new Receptionist({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    nric: req.body.nric,
                    address: req.body.address,
                    email: req.body.email,
                    password: randomPassword,
                    contactNo: req.body.contactNo,
                    clinic : manager.clinic._id
                });
                Receptionist.addUser(newReceptionist, (err, receptionist) => {
                    if(err){
                        return res.json({success: false, msg: err});
                    } else {
                        mailOptions.subject = "You have been added to " + manager.clinic.name;
                        mailOptions.text = "Dear " + receptionist.firstName + " " + receptionist.lastName + ", \n\n" + 
                            "We are pleased to inform you that your account with the role of receptionist has been successfully created\n\n" +
                            "Your login email will be " + receptionist.email + " and the password will be " + randomPassword + ". \n\n" +
                            "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                            "Best regards, \n" +
                            "GrabHealth Team"; 
                        mailOptions.to = receptionist.email;
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                                Receptionist.findByIdAndDelete(receptionist._id);
                                return res.json({success: false, msg: "Failed to send email"});
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        return res.json({success: true, msg: "Receptionist created"})
                    }
                });
            }
        })
     
});

router.post('/register/doctor', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => { 
    if(!Validator.validateNric(req.body.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    if(!Validator.validateEmail(req.body.email)) {
        return res.json({success:false, msg: "invalid email format" })
    };
    req.body.email = req.body.email.toLocaleLowerCase();
    Manager.findOne({ email: req.user.email })
        .populate({path: 'clinic', select: '-clinicLicenseNo'})
        .exec(function(err, manager){
            if(err){
                return res.json({success: false, msg: err});
            } else {
                var randomPassword = password.randomPassword({ characters: password.lower + password.upper + password.digits });
                let newDoctor = new Doctor({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    nric: req.body.nric,
                    address: req.body.address,
                    email: req.body.email,
                    password: randomPassword,
                    contactNo: req.body.contactNo,
                    doctorLicenseNo: req.body.doctorLicenseNo,
                    clinic : manager.clinic._id
                });
                Doctor.addUser(newDoctor, (err, doctor) => {
                    if(err){
                        return res.json({success: false, msg: err});
                    } else {
                        mailOptions.subject = "You have been added to " + manager.clinic.name;
                        mailOptions.text = "Dear " + doctor.firstName + " " + doctor.lastName + ", \n\n" + 
                            "We are pleased to inform you that your account with the role of doctor has been successfully created\n\n" +
                            "Your login email will be " + doctor.email + " and the password will be " + randomPassword + ". \n\n" +
                            "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                            "Best regards, \n" +
                            "GrabHealth Team"; 
                        mailOptions.to = doctor.email;
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                                Doctor.findByIdAndDelete(doctor._id);
                                return res.json({success: false, msg: "Failed to send email"});
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        return res.json({success: true, msg: "Doctor created"})
                    }
                });
            }
        })
     
});

router.get('/profile', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => {
    req.user.password = undefined;
    var exclusion = {_id:0};
    Clinic.findOne(req.user.clinic, exclusion, (err, clinic) => {
        if(err){
            console.log(err);
        }
        if(clinic){
            return res.json({user: req.user, clinic: clinic});
        }
    })
});

router.get('/clinic/team', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => {
    Receptionist.find({ clinic: req.user.clinic})
        .select('-password').exec(function (err, receptionists){
            Doctor.find({ clinic: req.user.clinic})
                .select('-password').exec(function (err, doctors){
                    res.send({'receptionists': receptionists, 'doctors': doctors}).status(201);
                });
        }); 
});

module.exports = router;