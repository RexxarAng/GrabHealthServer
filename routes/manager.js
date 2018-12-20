const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const Validator = require('../validation/validation');

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
        res.json({success: false, msg: "Permission denied!"})
    }
}

router.post('/register/receptionist', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => { 
    clinic;
    if(!Validator.validateNric(req.body.receptionist.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    if(!Validator.validateEmail(req.body.receptionist.email)) {
        return res.json({success:false, msg: "invalid email format" })
    };
    Manager.findOne({ email: req.body.email })
        .populate({path: 'clinic', select: '-clinicLicenseNo'})
        .exec(function(err, manager){
            if(err){
                return res.json({success: false, msg: err});
            } else {
                clinic = manager.clinic;
                var randomPassword = password.randomPassword({ characters: password.lower + password.upper + password.digits });
                let newReceptionist = new Receptionist({
                    firstName: req.body.receptionist.firstName,
                    lastName: req.body.manager.lastName,
                    nric: req.body.receptionist.nric,
                    address: req.body.receptionist.address,
                    email: req.body.receptionist.email,
                    password: randomPassword,
                    contactNo: req.body.receptionist.contactNo,
                    clinic : clinic._id
                });
                Receptionist.addUser(newReceptionist, (err, receptionist) => {
                    if(err){
                        return res.json({success: false, msg: err});
                    } else {
                        mailOptions.subject = "You have been added to " + clinic;
                        mailOptions.text = "Dear " + manager.firstName + " " + manager.lastName + ", \n\n" + 
                            "Thank you for your application. We are pleased to inform you that you have successfully registered your clinic with us.\n\n" +
                            "Your login email will be " + manager.email + " and the password will be " + randomPassword + ". \n\n" +
                            "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                            "Best regards, \n" +
                            "GrabHealth Team"; 
                        mailOptions.to = manager.email;
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                                Manager.findByIdAndDelete(manager._id);
                                Clinic.findByIdAndDelete(clinic._id);
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

module.exports = router;