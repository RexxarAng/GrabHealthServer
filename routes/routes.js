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
const bcrypt = require('bcryptjs');

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

router.post('/authenticate', (req, res) => {
    console.log(req.body);
    var role = req.body.role;
    const email = req.body.email;
    const password = req.body.password;
    if (password == undefined || password.length == 0) {
        return res.status(404).json({success: false, msg: "Invalid username or password"})
    }
    var currentRole;
    if(role === "Manager"){
        currentRole = Manager;
    } else if(role === "Receptionist") {
        currentRole = Receptionist;
    } else if (role === "Doctor") {
        curentRole = Doctor;
    } else {
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
                user.contactNo = undefined;
                console.log(user);
                if(role === "Manager" || role === "Doctor") {
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
                        role: role,
                        clinic: user.clinic
                    }
                });
            } else {
                return res.status(404).json({success: false, msg: "Invalid email or password entered."});
            }
        });
    });
});

router.post('/forgetpassword', (req, res) => {
    var role = req.body.role;
    var email = req.body.email;
    var nric = req.body.nric
    var currentRole;
    if(role === "Manager"){
        currentRole = Manager;
    } else if(role === "Receptionist") {
        currentRole = Receptionist;
    } else if (role === "Doctor") {
        curentRole = Doctor;
    } else {
        return res.status(404).json({success: false, msg: "Invalid role."})
    }
    currentRole.getUserByEmail(email, (err, user) => {
        if (err) {
            return res.status(404).json({success: false, msg: "Email doesn't exist"})
        }
        //Check if nric matches
        if (user.nric === nric) {
            var randomPassword = password.randomPassword({ characters: password.lower + password.upper + password.digits });
            mailOptions.subject = "You have successfully reset your password!";
            mailOptions.text = "Dear " + user.firstName + " " + user.lastName + ", \n\n" + 
                "Your password has successfully been reset to " +  randomPassword + ". \n\n" +
                "Best regards, \n" +
                "GrabHealth Team"; 
            mailOptions.to = user.email;
            transporter.sendMail(mailOptions, function(error, info){  
                if(error) {
                    console.log(error);
                    return res.json({success: false, msg: "Failed to send email"});
                } else {
                    //hash random password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(randomPassword, salt, (err, hash) =>{
                            if(err) throw err;
                            //set hashed random password as password in database
                            user.password = hash;
                            user.save();
                            console.log('Email sent: ' + info.response);
                            return res.json({success: true, msg: "Password successfully been reset"});
                        });
                    });

                }
            });
        }
    });
});


router.post('/createAdmin', (req, res) => {
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