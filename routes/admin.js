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
const axios = require('axios');
var speakeasy = require("speakeasy");
var QRCode = require('qrcode');
var crypto = require('crypto');
const passwordModule = require('secure-random-password');
const BlackList = require('../models/blacklist');
const MedicineList = require('../models/medicinelist');
algorithm = 'aes-256-gcm';
secretKey = 'D87314A83ABFB2312CF8F5386F62A6VS';
// do not use a global iv for production, 
// generate a new one for each encryption

function encrypt(text, iv) {
  var cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  var encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: tag
  };
}

function decrypt(encryptedContent, iv, tag) {
  var decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
  decipher.setAuthTag(tag);
  var dec = decipher.update(encryptedContent, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

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
    if(req.user.role === 'Admin') {
        next();
    } else {
        let token = new BlackList({
            token : req.headers.authorization
        });
        BlackList.addToken(token, (err, token) => {
            if(err){
                return res.json({success: false, unauthenticated: true, msg: err});
            } else {
                return res.json({success: false, unauthenticated: true, msg: "Blacklisted token"});
            }
        });
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

router.post('/authenticate2FA', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userToken = req.body.token;
    if (password == undefined || password.length == 0) {
        return res.status(404).json({success: false, msg: "Invalid username or password"})
    }
    Admin.getUserByEmail(email ,(err, user) => {
        if(err) {
            console.log(err);
            return res.status(400).json({success: false, msg: "Something happened"});
        }
        if(!user){
            return res.status(404).json({success: false, msg: "Invalid email or password entered."});
        }
        Admin.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                if(!user.twoFA) {
                    var secret = speakeasy.generateSecret();
                    var randomIv = passwordModule.randomPassword({ length: 13, characters: passwordModule.lower + passwordModule.upper + passwordModule.digits });
                    var resultEncrypted = encrypt(secret.base32, randomIv);
                    user.tempKey.secret =  resultEncrypted.content;
                    user.tempKey.iv = randomIv;
                    user.tempKey.tag = resultEncrypted.tag;
                    user.twoFA = true;
                    user.save();
                    QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
                        return res.json({success: true, msg: "QRCODE URL sent", setup: true, data: data_url});
                    });
                } else if(!userToken || userToken === ''){
                    return res.json({success: true, msg: "Show token field", verify: true});
                } else {
                    var base32secret = decrypt(user.tempKey.secret, user.tempKey.iv, user.tempKey.tag);
                    console.log(base32secret);
                    var verified = speakeasy.totp.verify({ 
                        secret: base32secret,
                        encoding: 'base32',
                        token: userToken
                    });
                    if(verified) {
                        if(user.key.secret === '') {
                            user.key.secret = user.tempKey.secret;
                            user.save();
                        }
                        let signedUser = new Admin(user);
                        signedUser.password = undefined;
                        signedUser.contactNo = undefined;
                        signedUser.tempKey = undefined;
                        signedUser.key = undefined;
                        const token = jwt.sign(JSON.parse(JSON.stringify(signedUser)), config.secret, {
                            expiresIn: 3600 
                        });
                        return res.json({
                            success: true,
                            authenticated: true,
                            token: 'JWT ' + token,  
                            user: {
                                id: user._id,
                                email: user.email,
                                role: 'Admin'                    
                            }
                        });
                    } else {
                        if(user.key === '') {
                            user.twoFA = false;
                            user.save();
                        }
                        
                        return res.json({success: false, msg: "Unable to authenticate 2FA"})
                    }     
                }
           
            } else {
                return res.status(404).json({success: false, msg: "Invalid email or password entered."});
            }
        });
    });
});

router.post('/authenticate', (req, res) => {
    var role = req.body.role;
    const email = req.body.email;
    const password = req.body.password;
    if (password == undefined || password.length == 0) {
        return res.status(404).json({success: false, msg: "Invalid username or password"})
    }

    Admin.getUserByEmail(email ,(err, user) => {
        if(err) {
            console.log(err);
            return res.status(400).json({success: false, msg: "Something happened"});
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

router.post('/createAdmin', [passport.authenticate('jwt', {session:false}), isAdmin, isNotBlackListedToken], (req, res, next) => {
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

router.post('/clinic/register', [passport.authenticate('jwt', {session:false}), isAdmin, isNotBlackListedToken], (req, res, next) => { 
    if(!Validator.validateNric(req.body.manager.nric)){
        return res.json({success:false, msg: "invalid ic number!"});
    };
    if(!Validator.validateEmail(req.body.manager.email)) {
        return res.json({success:false, msg: "invalid email format" })
    };
    if(!Validator.validateContactNo(req.body.manager.contactNo)){
        return res.json({success: false, msg: "Invalid contact number"})
    }
    req.body.manager.email = req.body.manager.email.toLocaleLowerCase();
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
                    let newMedicineList = new MedicineList({
                        clinic: clinic._id
                    })
                    MedicineList.addMedicineList(newMedicineList);
                    mailOptions.subject = "Thank you for registering your clinic with us!";
                    mailOptions.text = "Dear " + manager.firstName + " " + manager.lastName + ", \n\n" + 
                        "Thank you for your application. We are pleased to inform you that you have successfully registered your clinic with us.\n\n" +
                        "Your login email will be " + manager.email + " and the password will be " + randomPassword + ". \n\n" +
                        "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                        "Best regards, \n" +
                        "GrabHealth Team"; 
                    mailOptions.to = manager.email;
                    transporter.sendMail(mailOptions, function(error, info){
                        externalFail = false;
                        axios.post('http://localhost:4000/GrabHealthWeb/createClinic', {
                            _id: clinic._id,
                            name: req.body.clinic.name,
                            address: req.body.clinic.address,
                            location: req.body.clinic.location,
                            contactNo: req.body.clinic.contactNo,
                            clinicPhoto: req.body.clinic.clinicPhoto,
                            clinicLicenseNo: req.body.clinic.clinicLicenseNo
                        })
                        .then((res) => {
                            data = res['data'];
                            if(!data['success']) {
                                externalFail = true;   
                                console.log('Successful');
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            externalFail = true;
                        });
                        if (error || externalFail) {
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

router.get("/clinicList", [passport.authenticate('jwt', {session:false}), isAdmin, isNotBlackListedToken], (req, res, next) => {
    Clinic.find({})
        .populate({ path: 'clinicManager', select: '-password' })
        .populate({ path: 'doctors', select: '-password'})
        .populate({ path: 'receptionists', select: '-password'})
        .exec(function (err, clinics){
            res.json({'clinics': clinics}).status(201);
        }) 
});

router.post("/clinic/remove", [passport.authenticate('jwt', {session:false}), isAdmin, isNotBlackListedToken], (req, res, next) => {
    Clinic.findOne({clinicLicenseNo: req.body.clinicLicenseNo}, (err, clinic) => {
        if(err){
            return res.json({success: false, msg: 'Clinic doesnt exist'});
        }
        if(clinic){
            clinic.remove(function(err, removed) {
                if(err){
                    return res.json({success: false, msg: 'Something happened'});
                }
                if(removed){
                    axios.post('http://localhost:4000/GrabHealthWeb/removeClinic', {
                        clinicLicenseNo: req.body.clinicLicenseNo
                        })
                        .then((res) => {
                            data = res['data'];
                            if(data['success']){
                                console.log("successful!");
                            } else {
                                console.log("failed");
                            }  
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                    return res.json({success: true, msg: 'Clinic successfully deleted'});
                } else {
                    return res.json({success: false, msg: 'Clinic cannot be deleted'});
                }

            });
        }
    });
});

module.exports = router;