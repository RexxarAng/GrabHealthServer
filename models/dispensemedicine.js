const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const DispenseMedicineSchema = mongoose.Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
        //required: true
    },

    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    },

    medicineName: {
        type: String,
        unique: true,
        required: true
    },
    frequency: {
        type: String, // e.g: 1/day
        required: true

    },
    instructions:{ 
        type: String,
        required: true

    },
    dosage: {
        type: String, // e.g: 325mg
        required: true

    },
    usage: {
        type: String, // e.g: for headache
        required: true

    },
    mc: {
        type: Number,
        required: true
    },

    unitPrice: { 
        type: Schema.Types.Double,
        required: true
    }

});

const Medicine = module.exports = mongoose.model('DispenseMedicine', DispenseMedicineSchema);
