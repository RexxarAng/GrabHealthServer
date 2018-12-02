const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');


isManager = function(req, res, next){
    if(req.user.role == 'Manager') {
        next();
    } else {
        res.json({success: false, msg: "Permission denied!"})
    }
}

router.post('/register/receptionist', [passport.authenticate('jwt', {session:false}), isManager], (req, res, next) => { 
    let newReceptionist = new Receptionist({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        nric: req.body.nric,
        password: req.body.password
    });
    Receptionist.addUser(newReceptionist, (err, receptionist) => {
        if(err){
            return res.json({success: false, msg: err});
        } else {
            return res.json({success: true, msg: "Receptionist created"})
        }
    });
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