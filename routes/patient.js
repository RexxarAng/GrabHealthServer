const express = require('express');
const router = express.Router();
const Manager = require("../models/manager");
const Clinic = require("../models/clinic");
const Receptionist = require("../models/receptionist");
const passport = require('passport');
const Patient = require("../models/patient");


router.post('/addPatient', (req, res) => {
    console.log(req.body);
    let newPatient = new Patient(req.body);
    Patient.addUser(newPatient, (err, patient) => {
        if (err){
            return res.json({success: false, msg: err});
        } else {
            if (patient) {
                return res.json({success: true, msg: "Patient registered successfully"});
            }
        }
    });
});

module.exports = router;