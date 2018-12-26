const express = require('express');
const router = express.Router();
const password = require('secure-random-password');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Doctor = require('../models/doctor');
const Receptionist = require("../models/receptionist");
const Manager = require("../models/manager");
const Admin = require("../models/admin");
const nodemailer = require('nodemailer');
const Validator = require('../validation/validation');
const smtpTransport = require('nodemailer-smtp-transport');


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

router.post('/authenticate', (req, res, next) => {
    console.log(req.body);
    var role = req.body.role;
    const email = req.body.email;
    const password = req.body.password;
    if (password == undefined || password.length == 0) {
        return res.status(404).json({success: false, msg: "Invalid username or password"})
    }
    var currentRole;
    if(role == "Manager"){
        currentRole = Manager;
    } else if(role == "Receptionist") {
        currentRole = Receptionist;
    } else if (role == "Doctor") {
        currentRole = Doctor;
    } else if (role == "Admin") {
        currentRole = Admin;
    } 
    else {
        return res.status(404).json({success: false, msg: "Invalid role."})
    }
    currentRole.getUserByEmail(email ,(err, user) => {
        if(err) {
            console.log(err);
            return res.status(400).json({success: false, msg: "Something hapepned"});
        }
        if(!user){
            return res.status(404).json({success: false, msg: "Invalid email or password entered."});
        }
        currentRole.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                user.address = undefined;
                user.password = undefined;
                user.nric = undefined;
                user.clinic = undefined;
                user.contactNo = undefined;
                console.log(user);
                if(role == "Manager" || role == "Doctor") {
                    user.doctorLicenseNo = undefined;
                }
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


router.post('/createAdmin', (req, res, next) => {
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

module.exports = router;

