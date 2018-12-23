const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');

isReceptionist = function(req, res, next){
    if(req.user.role == 'Receptionist') {
        next();
    } else {
        res.json({success: false, msg: "Permission denied!"})
    }
}

module.exports = router;