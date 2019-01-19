const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
// const Doctor = require('./doctor');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const DoctorSchema = mongoose.Schema({
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
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },  
    contactNo: {
        type: Number,
        required: true
    },
    doctorLicenseNo: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    role: {
        type: String,
        required: true,
        default: 'Doctor'
    }

});

const Doctor = module.exports = mongoose.model('Doctor', DoctorSchema);

module.exports.getUserById = function(id, callback) {
    Doctor.findById(id, {password: 0}, callback);
}

module.exports.getUserByNric = function(nric, callback) {
    const query = {nric: nric};
    Doctor.findOne(query, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = { email: email };
    Doctor.findOne(query, callback);
}

module.exports.addUser = function(newDoctor, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newDoctor.password, salt, (err, hash) =>{
            if(err) throw err;
            newDoctor.password = hash;
            newDoctor.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

DoctorSchema.plugin(uniqueValidator, { message: "is already taken. "});

// module.exports.addDoctor = function(newDoctor, callback) {
//     newDoctor.save(callback);
    
// }

// Doctor.schema.path('nric').validate(function (value, respond) {
//     Doctor.findOne({ nric: value}, function (err, Doctor) {
//         if(Doctor) return false;
//         else return true;
//     });
// }, "This Doctor is already registered")

// Doctor.schema.path('email').validate(function (value, respond) {
//     Doctor.findOne({ email: value}, function (err, Doctor) {
//         if(Doctor) return false;
//         else return true;
//     });
// }, "This Doctor is already registered")