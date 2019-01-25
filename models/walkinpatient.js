const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');
const Validator = require('../validation/validation');

const Schema = mongoose.Schema;

const WalkInPatientSchema = mongoose.Schema({
    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        unique: true
    }

});

const WalkInPatient = module.exports = mongoose.model('WalkInPatient', WalkInPatientSchema);

module.exports.getUserById = function(id, callback) {
    WalkInPatient.findById(id, {password: 0}, callback);
}

module.exports.getUserByNric = function(nric, callback) {
    const query = {nric: nric};
    WalkInPatient.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback) {
    const query = {email: email};
    WalkInPatient.findOne(query, callback);
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

WalkInPatientSchema.plugin(uniqueValidator, { message: "is already taken. "});

