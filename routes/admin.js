const express = require('express');
const router = express.Router();
const Admin = require("../models/admin");
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const password = require('secure-random-password');
const passport = require('passport');
const nodemailer = require('nodemailer');
const Validator = require('../validation/validation');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');


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


isAdmin = function(req, res, next){
    if(req.user.role == 'Admin') {
        next();
    } else {
        res.json({success: false, msg: "Permission denied!"})
    }
}

router.post('/authenticate', (req, res, next) => {
    var role = req.body.role;
    const email = req.body.email;
    const password = req.body.password;
    if (password == undefined || password.length == 0) {
        return res.status(404).json({success: false, msg: "Invalid username or password"})
    }

    Admin.getUserByEmail(email ,(err, user) => {
        if(err) {
            console.log(err);
            return res.status(400).json({success: false, msg: "Something hapepned"});
        }
        if(!user){
            return res.status(404).json({success: false, msg: "Invalid email or password entered."});
        }
        Admin.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                user.password = undefined;
                user.contactNo = undefined;
                const token = jwt.sign(JSON.parse(JSON.stringify(user)), config.secret, {
                    expiresIn: 3600 
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,  
                    user: {
                        id: user._id,
                        email: user.email,
                        role: role
                    }
                });
            } else {
                return res.status(404).json({success: false, msg: "Invalid email or password entered."});
            }
        });
    });
});
//Create the admin for your database
router.post('/createFirstAdmin', (req, res, next) => {
    let newAdmin = new Admin({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        contactNo: req.body.contactNo
    });

    Admin.addUser(newAdmin, (err, admin) => {
        if(err){
            return res.json({success: false, msg: err});
        } else {
            return res.json({success: true, msg: "Admin created"});
        }
    });
});

router.post('/createAdmin', [passport.authenticate('jwt', {session:false}), isAdmin], (req, res, next) => {
    let newAdmin = new Admin({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        contactNo: req.body.contactNo
    });

    Admin.addUser(newAdmin, (err, admin) => {
        if(err){
            return res.json({success: false, msg: err});
        } else {
            return res.json({success: true, msg: "Admin created"});
        }
    });
});

router.post('/clinic/register', [passport.authenticate('jwt', {session:false}), isAdmin], (req, res, next) => { 
    if(!Validator.validateNric(req.body.manager.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    req.body.nric = req.body.nric.toUpperCase();
    if(!Validator.validateEmail(req.body.manager.email)) {
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
    Manager.addUser(newManager, (err, manager) => {
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
                    mailOptions.subject = "Thank you for registering your clinic with us!";
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
                    return res.json({success: true, msg: "Clinic and Manager successfuly registered"});
                    
                }
            });
        }
    })
});

router.get("/clinicList", [passport.authenticate('jwt', {session:false}), isAdmin], (req, res, next) => {
    Clinic.find({})
        .populate({ path: 'clinicManager', select: 'firstName lastName email _id address contactNo' })
        .exec(function (err, clinics){
            res.send({'clinics': clinics}).status(201);
        }) 
});

module.exports = router;