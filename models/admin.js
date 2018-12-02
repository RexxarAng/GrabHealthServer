const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');

const AdminSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
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
    role: {
        type: String,
        required: true,
        default: 'Admin'
    }

});

const Admin = module.exports = mongoose.model('Admin', AdminSchema);

module.exports.getUserById = function(id, callback) {
    Admin.findById(id, {password: 0}, callback);
}

module.exports.getUserByEmail = function(email, callback) {
    const query = {email: email};
    Admin.findOne(query, callback);
}

module.exports.addUser = function(newAdmin, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) =>{
            if(err) throw err;
            newAdmin.password = hash;
            newAdmin.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

AdminSchema.plugin(uniqueValidator, { message: "is already taken. "});

// module.exports.addAdmin = function(newAdmin, callback) {
//     newAdmin.save(callback);
    
// }

// Admin.schema.path('nric').validate(function (value, respond) {
//     Admin.findOne({ nric: value}, function (err, Admin) {
//         if(Admin) return false;
//         else return true;
//     });
// }, "This Admin is already registered")

// Admin.schema.path('email').validate(function (value, respond) {
//     Admin.findOne({ email: value}, function (err, Admin) {
//         if(Admin) return false;
//         else return true;
//     });
// }, "This Admin is already registered")