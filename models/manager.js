const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const ManagerSchema = mongoose.Schema({
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
        required: true
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
        default: 'Receptionist'
    }

});

const Manager = module.exports = mongoose.model('Manager', ManagerSchema);

module.exports.getUserById = function(id, callback) {
    Manager.findById(id, {password: 0}, callback);
}

module.exports.getUserByNric = function(nric, callback) {
    const query = {nric: nric};
    Manager.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback) {
    const query = {email: email};
    Manager.findOne(query, callback);
}

module.exports.addUser = function(newManager, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newManager.password, salt, (err, hash) =>{
            if(err) throw err;
            newManager.password = hash;
            newManager.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

ManagerSchema.plugin(uniqueValidator, { message: "is already taken. "});

// module.exports.addManager = function(newManager, callback) {
//     newManager.save(callback);
    
// }

// Manager.schema.path('nric').validate(function (value, respond) {
//     Manager.findOne({ nric: value}, function (err, manager) {
//         if(manager) return false;
//         else return true;
//     });
// }, "This manager is already registered")

// Manager.schema.path('email').validate(function (value, respond) {
//     Manager.findOne({ email: value}, function (err, manager) {
//         if(manager) return false;
//         else return true;
//     });
// }, "This manager is already registered")