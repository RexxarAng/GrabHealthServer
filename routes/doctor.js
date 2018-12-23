const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Doctor = require("../models/doctor");
const Receptionist = require("../models/receptionist");
const passport = require('passport');

isDoctor = function(req, res, next){
    if(req.user.role == 'Doctor') {
        next();
    } else {
        res.json({success: false, msg: "Permission denied!"})
    }
}
module.exports = router;