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
const MedicineList = require('../models/medicinelist');
const Medicine = require('../models/medicine');
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

isManager = function (req, res, next) {
    if (req.user.role == 'Manager') {
        next();
    } else {
        res.json({ success: false, unauthenticated: true, msg: "Permission denied!" })
    }
}

router.post('/register/receptionist', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateNric(req.body.nric)) {
        return res.json({ success: false, msg: "invalid ic number!" });
    };
    if (!Validator.validateEmail(req.body.email)) {
        return res.json({ success: false, msg: "invalid email format" })
    };
    if (!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({ success: false, msg: "Invalid contact number" })
    }
    req.body.email = req.body.email.toLocaleLowerCase();
    Manager.findOne({ email: req.user.email })
        .populate({ path: 'clinic', select: '-clinicLicenseNo' })
        .exec(function (err, manager) {
            if (err) {
                return res.json({ success: false, msg: err });
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
                    clinic: manager.clinic._id
                });
                Receptionist.addUser(newReceptionist, (err, receptionist) => {
                    if (err) {
                        return res.json({ success: false, msg: err });
                    } else {
                        mailOptions.subject = "You have been added to " + manager.clinic.name;
                        mailOptions.text = "Dear " + receptionist.firstName + " " + receptionist.lastName + ", \n\n" +
                            "We are pleased to inform you that your account with the role of receptionist has been successfully created\n\n" +
                            "Your login email will be " + receptionist.email + " and the password will be " + randomPassword + ". \n\n" +
                            "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                            "Best regards, \n" +
                            "GrabHealth Team";
                        mailOptions.to = receptionist.email;
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                Receptionist.findByIdAndDelete(receptionist._id);
                                return res.json({ success: false, msg: "Failed to send email" });
                            } else {
                                Clinic.findById(req.user.clinic, (err, clinic) => {
                                    if (err)
                                        console.log(error);
                                    if (clinic) {
                                        clinic.receptionists.push(receptionist._id)
                                        clinic.save();
                                    }

                                });
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        return res.json({ success: true, msg: "Receptionist created" })
                    }
                });
            }
        })

});

router.post('/edit/receptionist', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({ success: false, msg: "Invalid contact number" })
    }
    Receptionist.findOne({ nric: req.body.nric, clinic: req.user.clinic }, (err, receptionist) => {
        if (err)
            res.json({ success: false, msg: err });
        if (receptionist) {
            receptionist.firstName = req.body.firstName;
            receptionist.lastName = req.body.lastName;
            receptionist.contactNo = req.body.contactNo;
            receptionist.address = req.body.address;
            receptionist.save();
            res.json({ success: true, msg: "Receptionist updated" });
        }
    });
});

router.post('/remove/receptionist', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateNric(req.body.nric)) {
        return res.json({ success: false, msg: "invalid ic number!" });
    }
    Receptionist.findOneAndDelete({ nric: req.body.nric, clinic: req.user.clinic }, (err, deleted) => {
        if (err) {
            return res.json({ success: false, msg: err })
        }
        if (deleted) {
            Clinic.findById(req.user.clinic, (err, clinic) => {
                if (err)
                    console.log(error);
                if (clinic) {
                    clinic.receptionists.remove(deleted._id)
                    clinic.save();
                }
            });
            return res.json({ success: true, msg: "Receptionist successfully removed and deleted" })
        }
    })
});

router.post('/register/doctor', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateNric(req.body.nric)) {
        return res.json({ success: false, msg: "invalid ic number!" });
    };
    if (!Validator.validateEmail(req.body.email)) {
        return res.json({ success: false, msg: "invalid email format" })
    };
    if (!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({ success: false, msg: "Invalid contact number" })
    }
    req.body.email = req.body.email.toLocaleLowerCase();
    Manager.findOne({ email: req.user.email })
        .populate({ path: 'clinic', select: '-clinicLicenseNo' })
        .exec(function (err, manager) {
            if (err) {
                return res.json({ success: false, msg: err });
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
                    clinic: manager.clinic._id
                });
                Doctor.addUser(newDoctor, (err, doctor) => {
                    if (err) {
                        return res.json({ success: false, msg: err });
                    } else {
                        mailOptions.subject = "You have been added to " + manager.clinic.name;
                        mailOptions.text = "Dear " + doctor.firstName + " " + doctor.lastName + ", \n\n" +
                            "We are pleased to inform you that your account with the role of doctor has been successfully created\n\n" +
                            "Your login email will be " + doctor.email + " and the password will be " + randomPassword + ". \n\n" +
                            "We look forward to an enjoyable partnership with you and your clinic. \n\n" +
                            "Best regards, \n" +
                            "GrabHealth Team";
                        mailOptions.to = doctor.email;
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                Doctor.findByIdAndDelete(doctor._id);
                                return res.json({ success: false, msg: "Failed to send email" });
                            } else {
                                Clinic.findById(req.user.clinic, (err, clinic) => {
                                    if (err)
                                        console.log(error);
                                    if (clinic) {
                                        clinic.doctors.push(doctor._id);
                                        clinic.save();
                                    }
                                });
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        return res.json({ success: true, msg: "Doctor created" })
                    }
                });
            }
        })

});


router.post('/edit/doctor', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateContactNo(req.body.contactNo)) {
        return res.json({ success: false, msg: "Invalid contact number" })
    }
    Doctor.findOne({ nric: req.body.nric, clinic: req.user.clinic }, (err, doctor) => {
        if (err)
            res.json({ success: false, msg: err });
        if (doctor) {
            doctor.firstName = req.body.firstName;
            doctor.lastName = req.body.lastName;
            doctor.contactNo = req.body.contactNo;
            doctor.address = req.body.address;
            doctor.save();
            res.json({ success: true, msg: "Doctor updated" });
        }
    });
});

router.post('/remove/doctor', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    if (!Validator.validateNric(req.body.nric)) {
        return res.json({ success: false, msg: "invalid ic number!" });
    }
    Doctor.findOneAndDelete({ nric: req.body.nric, clinic: req.user.clinic }, (err, deleted) => {
        if (err) {
            return res.json({ success: false, msg: err })
        }
        if (deleted) {
            Clinic.findById(req.user.clinic, (err, clinic) => {
                if (err)
                    console.log(error);
                if (clinic) {
                    clinic.doctors.remove(deleted._id)
                    clinic.save();
                }
            });
            return res.json({ success: true, msg: "Receptionist successfully removed and deleted" })
        }
    })
});

router.get('/profile', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    req.user.password = undefined;
    var exclusion = { _id: 0 };
    Clinic.findOne(req.user.clinic, exclusion, (err, clinic) => {
        if (err) {
            console.log(err);
        }
        if (clinic) {
            return res.json({ user: req.user, clinic: clinic });
        }
    })
});

router.get('/clinic/team', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    Receptionist.find({ clinic: req.user.clinic })
        .select('-password').exec(function (err, receptionists) {
            Doctor.find({ clinic: req.user.clinic })
                .select('-password').exec(function (err, doctors) {
                    res.send({ 'success': true, 'receptionists': receptionists, 'doctors': doctors }).status(201);
                });
        });
});


router.get('/medicineList', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    MedicineList.findOne({ clinic: req.user.clinic })
        .populate({ path: 'list', select: 'name category price effects' })
        .exec(function (err, medicineList) {
            res.send({ 'medicineList': medicineList }).status(201);
        })
});

router.post('/add/medicine', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    req.body.clinic = req.user.clinic;
    let newMedicine = new Medicine(req.body);
    MedicineList.findOne({ clinic: req.user.clinic }, (err, medicineList) => {
        if (err)
            return res.json({ success: false, msg: 'Medicine list cannot be found' });
        if (medicineList) {
            Medicine.findOne({ name: req.body.name }, (err, medicine) => {
                if (err)
                    console.log(err);
                if (!medicine) {
                    newMedicine.save(function (err, medicine) {
                        if (err)
                            return res.json({ success: false, msg: 'Medicine cannot be added' });
                        if (medicine) {
                            medicineList.list.push(medicine._id);
                            medicineList.save();
                            return res.json({ success: true, msg: "Medicine successfully added" })
                        }
                        else
                            return res.json({ success: false, msg: 'Medicine cannot be added' });
                    });
                } else {
                    console.log(medicine);
                    return res.json({ success: false, msg: 'Medicine name already taken' });
                }
            })
        }
    });
});

router.post('/remove/medicine', [passport.authenticate('jwt', { session: false }), isManager], (req, res, next) => {
    MedicineList.findOne({ clinic: req.user.clinic }, (err, medicineList) => {
        if (err)
            return res.json({ success: false, msg: 'Medicine list cannot be found' });
        if (medicineList) {
            Medicine.findById(req.body._id, (err1, medicine) => {
                if (err1)
                    return res.json({ success: false, msg: 'Medicine cannot be found' });
                medicine.remove(function (err2, medicineRemoved) {
                    if (err2)
                        return res.json({ success: false, msg: 'Medicine cannot be removed' });
                    if (medicineRemoved) {
                        medicineList.list.remove(medicine._id);
                        medicineList.save();
                        return res.json({ success: true, msg: "Medicine successfully removed" })
                    }
                    else
                        return res.json({ success: false, msg: 'Medicine cannot be removed' });
                });
            });
        }
    });
});
module.exports = router;