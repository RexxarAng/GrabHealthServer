const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');
const Validator = require('../validation/validation');

const PatientSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    nric: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },  
    contactNo: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    queueNo: {
        type: Number,
        required: false
    }

});

const Patient = module.exports = mongoose.model('Patient', PatientSchema);

module.exports.getUserById = function(id, callback) {
    Patient.findById(id, {password: 0}, callback);
}

module.exports.getUserByNric = function(nric, callback) {
    const query = {nric: nric};
    Patient.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback) {
    const query = {email: email};
    Patient.findOne(query, callback);
}

module.exports.addUser = function(newPatient, callback) {
    newPatient.save(callback);

}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

PatientSchema.plugin(uniqueValidator, { message: "is already taken. "});

