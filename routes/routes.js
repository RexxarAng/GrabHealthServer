const express = require('express');
const router = express.Router();
const password = require('secure-random-password');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const Receptionist = require("../models/receptionist");
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const nodemailer = require('nodemailer');
const Validator = require('../validation/validation');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'grabhealthteam@gmail.com',
      pass: 'GrabHealth2018S2ABCE'
    }
  });
  
  var mailOptions = {
    from: 'grabhealthteam@gmail.com',
    to: 'Enter recipient email address',
    subject: 'Enter subject',
    text: 'Enter text'
  };
router.post('/receptionist/register', (req, res, next) => { 
    let newReceptionist = new({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        ic: req.body.ic,
        password: req.body.password
    });
    Receptionist.addReceptionist(newReceptionist, (err, receptionist) => {
        if(err){
            return res.json({success: false, msg: "Failed to register receptionist"});
        } else {
            return res.json({success: true, msg: "Receptionist created"})
        }
    });
});


router.post('/clinic/register', (req, res, next) => { 
    if(!Validator.validateNric(req.body.manager.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    if(Validator.validateEmail(req.body.manager.email)) {
        return res.json({success:false, msg: "invalid email format" })
    };
    var randomPassword = password.randomPassword({ characters: password.lower + password.upper + password.digits });
    let newManager = new Manager({
        firstName: req.body.manager.firstName,
        lastName: req.body.manager.lastName,
        nric: req.body.manager.nric,
        address: req.body.manager.address,
        email: req.body.manager.email,
        password: randomPassword,
        contactNo: req.body.manager.contactNo,
        doctorLicenseNo: req.body.manager.doctorLicenseNo,
    });
    Manager.addManager(newManager, (err, manager) => {
        if(err){
            return res.json({success: false, msg: err});
        } else {  
            managerId = manager._id;
            let newClinic = new Clinic({
                name: req.body.clinic.name,
                address: req.body.clinic.address,
                location: req.body.clinic.location,
                contactNo: req.body.clinic.contactNo,
                clinicPhoto: req.body.clinic.clinicPhoto,
                clinicLicenseNo: req.body.clinic.clinicLicenseNo,
                clinicManager: managerId
            });
            Clinic.addClinic(newClinic, (err, clinic) => {
                if(err){
                    Manager.findByIdAndDelete(manager._id);
                    return res.json({success: false, msg: err});
                } else {
                    Manager.findOne({ nric: req.body.manager.nric}, (err, updateManager) => {
                        updateManager.clinic = clinic._id;
                        updateManager.save();
                    });
                    mailOptions.subject = "Thank you for registering your clinic with us!"
                    mailOptions.text = "You have successfully registered your clinic under " + manager.email + "and the password will be " + randomPassword
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });
                    return res.json({success: true, msg: "Clinic and Manager successfuly registered"});
                    
                }
            });
        }
    })
});


module.exports = router;