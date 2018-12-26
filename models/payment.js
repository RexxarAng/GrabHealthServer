const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const PaymentSchema = mongoose.Schema({
    receiptNo: {
        type: String,
        unique: true 
    },
    date: {
        type: Date,
        default: Date.now
    },
    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    }, 
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    medPrescription: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    }

});

const Payment = module.exports = mongoose.model('Payment', PaymentSchema);

module.exports.addPayment = function(newPayment, callback) {
    newPayment.save(callback);
      
}
PaymentSchema.plugin(uniqueValidator, { message: "is already taken. "});

