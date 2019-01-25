const mongoose = require('mongoose');
const config = require("../config/database");
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const VisitSchema = mongoose.Schema({
     patient: {
         type: Schema.Types.ObjectId,
         ref: 'Patient',
         required: true
     },
     completed:{
         type: Boolean,
         required: true,
         default: false
    },
    reasonForVisit: {
        type: String,
        required: true
    },
    medicineList: [{
        type: Schema.Types.ObjectId,
        ref: 'Medicine',
    }],
    queueNo:{
        type:Number,
        required: true
    },
    clinic:{
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    }

  

    

});

const Visit = module.exports = mongoose.model('Visit', VisitSchema);
module.exports.addReasonForVisit = function (reasonForVisit, callback) {
    reasonForVisit.save(callback);
}

module.exports.addMedicine = function (selectedMedicine, callback) {
    selectedMedicine.save(callback);
}