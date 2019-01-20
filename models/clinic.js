const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');
const Manager = require('./manager');
const Receptionist = require('./receptionist');
const Doctor = require('./doctor');
const MedicineList = require('./medicinelist');
const Medicine = require('./medicine');
const Schema = mongoose.Schema;

const ClinicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true
    },
    clinicLicenseNo: {
        type: String,
        required: true,
        unique: true
    },
    clinicPhoto: {
        type: String,
        required: true
    },
    clinicManager: {
        type: Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
    receptionists: [{
        type: Schema.Types.ObjectId,
        ref: 'Receptionist'
    }],
    doctors: [{
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    consultationFee: {
        type: Number,
        default: 20
    }

});


ClinicSchema.pre('remove', function(next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.
    MedicineList.deleteOne({clinic: this._id}).exec();
    Manager.deleteOne({clinic: this._id}).exec();
    Doctor.deleteMany({clinic: this._id}).exec();
    Receptionist.deleteMany({clinic: this._id}).exec();
    Medicine.deleteMany({clinic: this._id}).exec();
    next();
});
const Clinic = module.exports = mongoose.model('Clinic', ClinicSchema);

module.exports.getClinicById = function(id, callback) {
    Clinic.findById(id, callback);
}

module.exports.getClinicByName = function(name, callback) {
    const query = {name: name};
    Clinic.findOne(query, callback);
}


module.exports.addClinic = function(newClinic, callback) {
    newClinic.save(callback);
      
}

ClinicSchema.plugin(uniqueValidator, { message: "is already taken. "});

// Clinic.schema.path('name').validate(function (value, respond) {
//     Clinic.findOne({ name: value}, function (err, clinic) {
//         if(clinic) return false;
//         else return true;
//     });
// }, "This clinic name is already registered")

// Clinic.schema.path('clinicLicenseNo').validate(function (value) {
//     Clinic.findOne({ clinicLicenseNo: value}, function (err, clinic) {
//         if(clinic) return false;
//         else return true;
//     });
// }, "This clinic license no is already registered")

